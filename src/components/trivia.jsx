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
  const [played, setPlayed] = useState([])
  const [nPlayed, setNPlayed] = useState(0)
  const [rndSortOptions, setRndSortOptions] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION)
  const [toSend, setToSend] = useState([])
  const [bonusCategory, setBonusCategory] = useState(undefined)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  const fetching = async (nPlayedUpdated) => {

    let cats
    if(!categories.length > 0) {
      //set categories
      const catsRes = await fetch(BACKEND_URL + '/trivia/categories', { method: 'GET', credentials: 'include' })
      if (!catsRes.ok) return
      cats = await catsRes.json()
      setCategories(cats)
    } else cats = categories
    const fetchThisN = nPlayedUpdated ?? 0

    const question1Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[fetchThisN % cats.length].category_id}`, { method: 'POST', credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({played})
    })
    if (!question1Res.ok) return
    const question1 = await question1Res.json()
    setCurrentQuestion(question1)
    setRndSortOptions([...question1.options].sort(() => Math.random() - 0.5))
    startTimer({nPlayedUpdated: fetchThisN})
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
    fetching()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = (e) => {
    if (e.target.classList.contains('disabled') || e.target.classList.contains('correct') || e.target.classList.contains('incorrect')) return
    //agregar a played
    const playedI = played.findIndex(pl => pl.category_id === currentQuestion.category_id)
    if(playedI === -1){
      setPlayed(played =>[...played, { category_id: currentQuestion.category_id, questions_id: [currentQuestion.question_id] }])
    } else setPlayed(pd => {
      pd[playedI].questions_id.push(currentQuestion.question_id)
      return pd
    })
    //comprobar
    if (currentQuestion.options.findIndex(option => option === e.target.textContent) === 0){
      //corecta !
      e.target.classList.add('correct')
      document.querySelectorAll('button').forEach(btn => btn !== e.target && btn.classList.add('disabled'))
      setToSend([...toSend, {question_id: currentQuestion.question_id, is_correct: true, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}])
    } else {
      //incorrecta
      e.target.classList.add('incorrect')
      document.querySelectorAll('button').forEach(btn => {
        if(btn.textContent === currentQuestion.options[0]) return btn.classList.add('correct')
        if(btn === e.target) return 
        btn.classList.add('disabled')
      })
      setToSend([...toSend, {question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}])
    }
    //siguiente - copair esto
    setNPlayed(nPlayed => nPlayed + 1)
    const nPlayedUpdated = nPlayed + 1
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => {
      if (nPlayedUpdated === (AMMOUNT_OF_QUESTIONS - 1)) {
        //bonus
        setBonusCategory('choosing')
      } else if (nPlayedUpdated >= AMMOUNT_OF_QUESTIONS) {
        //send results
      } else getNewQuestion({nPlayedUpdated})
    }, 1500)
  }
  const getNewQuestion = async ({nPlayedUpdated, findThisCategoryForNow})=>{
      document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('correct')
        btn.classList.remove('incorrect')
        btn.classList.remove('disabled')
      })
      setRndSortOptions([...nextQuestion.options].sort(() => Math.random() - 0.5))
      if(!findThisCategoryForNow) {
        console.log("no hay find this category for now")
        console.log(findThisCategoryForNow)
        if (nextQuestion) setCurrentQuestion(nextQuestion)
        else fetching(nPlayedUpdated)
        setNextQuestion({})
      }
      //fetch
      let newQuestion = await fetch(BACKEND_URL + `/trivia?category_id=${findThisCategoryForNow ?? categories[(categories.findIndex(cat => cat.category_id === currentQuestion.category_id) + 2) % categories.length].category_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          played
        })
      })
      if(!newQuestion.ok) return //error
      newQuestion = await newQuestion.json()
      console.log(newQuestion)
      if(findThisCategoryForNow !== undefined) setCurrentQuestion(newQuestion)
      else setNextQuestion(newQuestion)
      
      startTimer({nPlayedUpdated})
    }
  const handleCategoryClick = (e) => {
    let findThisCategoryForNow = categories.find(cat => cat.category_name === e.target.textContent).category_id
    setBonusCategory(findThisCategoryForNow)
    document.querySelectorAll('.t-category-btn').forEach(btn => btn.removeEventListener('click', handleCategoryClick))
    getNewQuestion({findThisCategoryForNow})
  }
  useEffect(() => {
    if (bonusCategory !== 'choosing') return
    document.querySelectorAll('.t-category-btn').forEach(btn => {
      btn.addEventListener('click', handleCategoryClick)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[bonusCategory])

  const startTimer = ({nPlayedUpdated}) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSecondsLeft(TIME_PER_QUESTION)
    let seconds = TIME_PER_QUESTION
    timerRef.current = setInterval(() => {
      if (seconds > 0) {
        seconds -= 0.25
        setSecondsLeft(seconds)
      } else {
        //se te acabo el tiempo
        setSecondsLeft(0)
        document.querySelectorAll('button').forEach(btn => {
          if(btn.textContent === currentQuestion.options[0]) return btn.classList.add('correct')
          btn.classList.add('disabled')
        })
        setToSend([...toSend, {question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)}])
        
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => {
          if (nPlayedUpdated === (AMMOUNT_OF_QUESTIONS - 1)) {
            //bonus
            setBonusCategory('choosing')
          } else if (nPlayedUpdated >= AMMOUNT_OF_QUESTIONS) {
            //send results
          } else getNewQuestion({nPlayedUpdated})
        }, 1500)
      }
    }, 250)
  }
  // useEffect(() => {return () => clearInterval(timerRef.current)}, [])
  useEffect(() => {
    if (nPlayed >= AMMOUNT_OF_QUESTIONS){
      console.log({
        results: toSend,
        userInfo: {
          bonus_category_id: bonusCategory
        }})
      localStorage.setItem('precition', `${played.filter(pl => pl.is_correct).length}`)
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
    }

  }, [bonusCategory, nPlayed, navigate, played, toSend])

  return (
    <div className="main-cont t-main-cont main-bkgc">
      <header className="t-header">
        <h1>Trivia de Conocimiento General</h1>
      </header>
      <main className={`t-main secn-bkgc ${bonusCategory === 'choosing' ? 'choosing' : ''}`}>
        {currentQuestion.question_text && bonusCategory !== 'choosing' && (
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
        {bonusCategory === 'choosing' && (
          <>
            <h4>Última pregunta</h4>
            <h2>Elija una categoría</h2>
            <div className="t-category-btn-cont">
              {categories.map((cat, index) => {
                return (
                  <button className="t-category-btn"key={index}>{cat.category_name}</button>
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
