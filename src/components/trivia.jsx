/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL, AMMOUNT_OF_QUESTIONS, TIME_PER_QUESTION } from '../constants'
import '../css/trivia.css'
import '../index.css'
import confetti from "canvas-confetti"
import Loading from "./loading"

export default function Trivia() {
  const [loading, setLoading] = useState(false)
  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)

  const [categories, setCategories] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({})
  const [nextQuestion, setNextQuestion] = useState({})
  const [rndSortOptions, setRndSortOptions] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_QUESTION)
  const [pickingBonusCat, setPickingBonusCat] = useState(false)
  const [toSend, setToSend] = useState([])
  const [played, setPlayed] = useState([])
  const [bonusCategory, setBonusCategory] = useState(undefined)

  const timerRef = useRef(null)
  const navigate = useNavigate()
  const playedRef = useRef([])

  const fetching = async ({fetchThisN}) => {
    let cats
    if(categories.length === 0) {
      //set categories
      const stringedId = localStorage.getItem('id')
      const id = stringedId ? JSON.parse(stringedId) : undefined
      const catsRes = await fetch(BACKEND_URL + '/trivia/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({id})})
      if (!catsRes.ok) {
        catsRes.json().then(err => {
          err?.redirect && navigate(err.redirect)
        })
      }
      cats = await catsRes.json()
      setCategories(cats)
    } else cats = categories
    fetchThisN = fetchThisN ?? 0
    const question1Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[fetchThisN % cats.length].category_id}`, { method: 'POST',  
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({played: playedRef.current})
    })
    stopLoading()
    if (!question1Res.ok) {
      question1Res.json().then(err => {
        err?.redirect && navigate(err.redirect)
      })
    }
    const question1 = await question1Res.json()
    setCurrentQuestion(question1)
    setRndSortOptions([...question1.options].sort(() => Math.random() - 0.5))
    const question2Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[fetchThisN + 1 % cats.length].category_id}`, { method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({played: playedRef.current})
    })
    if (!question2Res.ok) return
    const question2 = await question2Res.json()
    setNextQuestion(question2)
  }

  useEffect(() => {
    //inicar
    if (categories.length > 0) return
    startLoading()
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
    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])
  
  const handleAnswerSubmit = ({ e, currentQuestion }) => {
    let updatedToSend = [...toSend]
    //si viene de un boton
    if(e){
      if (currentQuestion.options.findIndex(option => option === e.target.textContent) === 0){
        //corecta !
        confetti()
        e.target.classList.add('correct')
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === currentQuestion.options[0]) btn.classList.add('correct')
    else if (btn !== e.target) btn.classList.add('disabled')
  })
        console.log(e.target.classList.contains('correct'))
        updatedToSend.push({question_id: currentQuestion.question_id, is_correct: true, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)})
      } else {
        //incorrecta
        e.target.classList.add('incorrect')
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === currentQuestion.options[0]) btn.classList.add('correct')
    else if (btn !== e.target) btn.classList.add('disabled')
  })
        console.log(e.target.classList.contains('incorrect'))
        updatedToSend.push({question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)})
      }
    } else {
      //si no viene de un boton
      document.querySelectorAll('button').forEach(btn => {
        if(btn.textContent == currentQuestion.options[0]) return btn.classList.add('correct')
        btn.classList.add('disabled')
      })
      //preparar set to send
      updatedToSend.push({question_id: currentQuestion.question_id, is_correct: false, response_time: Math.round(TIME_PER_QUESTION-secondsLeft)})
    }

    setToSend(updatedToSend)

    //guardar played
    addToPlayed(currentQuestion)
    //eliminar intervalo
    if (timerRef.current) clearInterval(timerRef.current)
    //Sumar nPlayed
    setNPlayed(nPlayed => nPlayed + 1)
  }
  const addToPlayed = (currentQuestion) => {
    const playedI = playedRef.current.findIndex(pl => pl.category_id === currentQuestion.category_id)
    let updatedPlayed = [...playedRef.current]
    if (playedI === -1) {
      updatedPlayed.push({ category_id: currentQuestion.category_id, questions_id: [currentQuestion.question_id] })
    } else {
      updatedPlayed[playedI].questions_id.push(currentQuestion.question_id)
    }
    playedRef.current = updatedPlayed
    setPlayed(updatedPlayed)
  }

  useEffect(() => {
    if (nPlayed <= 0) return
    //esperar para siguiente pregunta
    setTimeout(() => {
      if (nPlayed === (AMMOUNT_OF_QUESTIONS - 1)) {
        //bonus
        setPickingBonusCat(true)
      } else if (nPlayed >= AMMOUNT_OF_QUESTIONS) {
        //guardar en local storage
        localStorage.setItem('trivaScore', JSON.stringify(toSendRef.current.filter(t => t.is_correct === true).length) / AMMOUNT_OF_QUESTIONS * 100)
        const stringedId = localStorage.getItem('id')
        const id = stringedId ? JSON.parse(stringedId) : undefined
        //mandar resultados
        fetch(BACKEND_URL + '/trivia/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id,
            results: toSendRef.current,
            userInfo: {
              bonus_category_id: bonusCategoryRef.current
            }
          })
        }).then(res => {
          if(!res.ok) {
            res.json().then(err => {
              err?.redirect && navigate(err.redirect)
            })
          }
          navigateRef.current('/gracias')
        })
      } else {
        getNewQuestion()
      }
    }, 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nPlayed])


  const toSendRef = useRef(toSend)
  const navigateRef = useRef(navigate)
  const bonusCategoryRef = useRef(bonusCategory)
  
  useEffect(() => {
    toSendRef.current = toSend
  }, [toSend])
  
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])
  
  useEffect(() => {
    bonusCategoryRef.current = bonusCategory
  }, [bonusCategory])

  useEffect(() => {
    playedRef.current = played
  }, [played])

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

    //fetch if is not last
    if (nPlayed === (AMMOUNT_OF_QUESTIONS - 2)) return

    if(fetchThis !== undefined) startLoading()
    let newQuestion = await fetch(BACKEND_URL + `/trivia?category_id=${fetchThis ?? categories[(categories.findIndex(cat => cat.category_id === currentQuestion.category_id) + 2) % categories.length].category_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        played: playedRef.current
      })
    })
    stopLoading()
    if(!newQuestion.ok) {
      newQuestion.json().then(err => {
        err?.redirect && navigate(err.redirect)
      })}
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
  let touchHandled = false
  const handleCategoryClick = (e) => {
    if (!touchHandled){
    let selectedCategory = categories.find(cat => cat.category_name === e.target.textContent).category_id
    setPickingBonusCat(false)
    setBonusCategory(selectedCategory)
    getNewQuestion(selectedCategory)
    }
    touchHandled = false
  }
  const handleTouch = (e) => {
    touchHandled = true
    let selectedCategory = categories.find(cat => cat.category_name === e.target.textContent).category_id
    setPickingBonusCat(false)
    setBonusCategory(selectedCategory)
    getNewQuestion(selectedCategory)
  }
  
  

  return (
    <div className="main-cont t-main-cont main-bkgc">
      {loading && <Loading />}
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
                    <button key={currentQuestion.question_id * 10 + index} onClick={handleClick} onTouchStart={handleTouch}>{option}</button>
                  )})}
                </div>
                <div className="seconds">
                  {rndSortOptions.map((option, index) => { if (index > 1 || option === undefined || option === null) return 
                  return (
                    <button key={currentQuestion.question_id * 10 + index} onClick={handleClick} onTouchStart={handleTouch}>{option}</button>
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
