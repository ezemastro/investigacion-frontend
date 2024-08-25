import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL, AMMOUNT_OF_QUESTIONS, TIME_PER_QUESTION } from '../constants'
import '../css/trivia.css'

//falta:
//  lograr que se guarde en local storage
//  played no se está enviando bien porque hay preguntas qeu se repiten

export default function Trivia() {
  const [categories, setCategories] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [nextQuestion, setNextQuestion] = useState({})
  const [rndSortOptions, setRndSortOptions] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION)
  const [pickingBonusCat, setPickingBonusCat] = useState(false)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  const fetching = async ({fetchThisN}) => {
    let cats
    if(categories.length === 0) {
      //set categories
      const catsRes = await fetch(BACKEND_URL + '/trivia/categories', { method: 'GET', credentials: 'include' })
      if (!catsRes.ok) return
      cats = await catsRes.json()
      setCategories(cats)
    } else cats = categories
    fetchThisN = fetchThisN ?? 0
    const question1Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[fetchThisN % cats.length].category_id}`, { method: 'POST', credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({played})
    })
    if (!question1Res.ok) return
    const question1 = await question1Res.json()
    setCurrentQuestion(question1)
    setRndSortOptions([...question1.options].sort(() => Math.random() - 0.5))
    const question2Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[fetchThisN + 1 % cats.length].category_id}`, { method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({played})
    })
    if (!question2Res.ok) return
    const question2 = await question2Res.json()
    setNextQuestion(question2)
  }
  useEffect(() => {
    //inicar
    if (categories.length > 0) return
    fetching({})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //-----------------------
  const [nPlayed, setNPlayed] = useState(0)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    //start timer
    setSecondsLeft(TIME_PER_QUESTION)
    let seconds = TIME_PER_QUESTION
    timerRef.current = setInterval(() => {
      if (seconds > 0) {
        seconds -= 0.25
        setSecondsLeft(seconds)
      } else {
        //se te acabo el tiempo
        handleAnswerSubmit({ currentQuestion })
        setSecondsLeft(0)
      }
    }, 250)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])
  
  let toSend = []
  let played = []
  const handleAnswerSubmit = ({ e, currentQuestion }) => {
    //si viene de un boton
    if(e){
      if (currentQuestion.options.findIndex(option => option === e.target.textContent) === 0){
        //corecta !
        e.target.classList.add('correct')
        document.querySelectorAll('button').forEach(btn => btn !== e.target && btn.classList.add('disabled'))
        toSend = [...toSend, {question_id: currentQuestion.question_id, is_correct: true, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}]
      } else {
        //incorrecta
        e.target.classList.add('incorrect')
        document.querySelectorAll('button').forEach(btn => {
          if(btn.textContent === currentQuestion.options[0]) return btn.classList.add('correct')
          if(btn === e.target) return 
          btn.classList.add('disabled')
        })
        toSend =[...toSend, {question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}]
      }
    } else {
      //si no viene de un boton
      document.querySelectorAll('button').forEach(btn => {
        if(btn.textContent == currentQuestion.options[0]) return btn.classList.add('correct')
        btn.classList.add('disabled')
      })
      //preparar set to send
      toSend = ([...toSend, {question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}])
    }

    //guardar played
    addToPlayed(currentQuestion)
    //eliminar intervalo
    if (timerRef.current) clearInterval(timerRef.current)
    //Sumar nPlayed
    setNPlayed(nPlayed => nPlayed + 1)
  }
  const addToPlayed = (currentQuestion) => {
    const playedI = played.findIndex(pl => pl.category_id === currentQuestion.category_id)
    if (playedI === -1) played.push({ category_id: currentQuestion.category_id, questions_id: [currentQuestion.question_id] })
    else played[playedI].questions_id.push(currentQuestion.question_id)
  }

  useEffect(() => {
    if (nPlayed <= 0) return
    //esperar para siguiente pregunta
    setTimeout(() => {
      if (nPlayed === (AMMOUNT_OF_QUESTIONS - 1)) {
        //bonus
        setPickingBonusCat(true)
      } else if (nPlayed >= AMMOUNT_OF_QUESTIONS) {
        //mandar resultados
        fetch(BACKEND_URL + '/trivia/send', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            results: toSend,
            userInfo: {
              bonus_category_id: bonusCategory
            }
          })
        }).then(res => {
          if(!res.ok) return //error
          navigate('/gracias')
        })
      } else {
        getNewQuestion()
      }
    }, 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nPlayed])


  const getNewQuestion = async (fetchThis) => {
    //eliminar buton calses
    document.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('correct')
      btn.classList.remove('incorrect')
      btn.classList.remove('disabled')
    })

    if(fetchThis === undefined) {
      setCurrentQuestion(nextQuestion)
      setRndSortOptions([...nextQuestion.options].sort(() => Math.random() - 0.5))
    }

    //fetch
    let newQuestion = await fetch(BACKEND_URL + `/trivia?category_id=${fetchThis ?? categories[(categories.findIndex(cat => cat.category_id === currentQuestion.category_id) + 2) % categories.length].category_id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        played
      })
    })
    if(!newQuestion.ok) return //error
    newQuestion = await newQuestion.json()
    if(fetchThis !== undefined) {
      setCurrentQuestion(newQuestion)
      setRndSortOptions([...newQuestion.options].sort(() => Math.random() - 0.5))
    } else {
      setNextQuestion(newQuestion)
    }
  }


  const handleClick = (e) => {
    if (e.target.classList.contains('disabled') || e.target.classList.contains('correct') || e.target.classList.contains('incorrect')) return
    handleAnswerSubmit({ e, currentQuestion })
  }

  //pregunta bonus
  let bonusCategory = undefined
  const handleCategoryClick = (e) => {
    let selectedCategory = categories.find(cat => cat.category_name === e.target.textContent).category_id
    setPickingBonusCat(false)
    bonusCategory = selectedCategory
    getNewQuestion(selectedCategory)
  }
  //-----------------------

  return (
    <div className="main-cont t-main-cont main-bkgc">
      <header className="t-header">
        <h1>Trivia de Conocimiento General</h1>
      </header>
      <main className={`t-main secn-bkgc ${pickingBonusCat ? 'choosing' : ''}`}>
        {currentQuestion?.question_text && !pickingBonusCat && (
          <>
            <h3>Tema: <span>{categories.find(cat => cat.category_id === currentQuestion.category_id).category_name}</span></h3>
            <section className="t-question-cont">
              <h2>{currentQuestion.question_text}</h2>
              <div className="t-btn-cont">
                <div className="firsts">
                  {rndSortOptions.map((option, index) => { if (index < 2 || option === undefined || option === null) return 
                  return (
                    <button key={currentQuestion.question_id * 10 + index} onClick={handleClick}>{option}</button>
                  )})}
                </div>
                <div className="seconds">
                  {rndSortOptions.map((option, index) => { if (index > 1 || option === undefined || option === null) return 
                  return (
                    <button key={currentQuestion.question_id * 10 + index} onClick={handleClick}>{option}</button>
                  )})}
                </div>
              </div>
            </section>
            <div className="t-timer">
              <span>{Math.ceil(secondsLeft)}</span>
              <div className="t-timer-guide">
                <div id="t-timer-track" style={{ height: `${secondsLeft / TIME_PER_QUESTION * 100}%` }} />
                </div>
            </div>
            
          </>
        )}
        {pickingBonusCat && (
          <>
            <h4>Última pregunta</h4>
            <h2>Elija una categoría</h2>
            <div className="t-category-btn-cont">
              {categories.map((cat, index) => {
                return (
                  <button className="t-category-btn" key={index} onClick={handleCategoryClick}>{cat.category_name}</button>
                )
              })}
            </div>
          </>
        )}
        <div className="t-progress-cont">
          <div className="t-progress">
            <div className="t-progress-track" style={{ width: `${nPlayed / AMMOUNT_OF_QUESTIONS * 100}%` }}></div>
          </div>
        </div>
        <div />
      </main>
      <footer className="t-footer" />
    </div>
  )
}
