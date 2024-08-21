import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL, AMMOUNT_OF_QUESTIONS, TIME_PER_QUESTION } from '../constants'
import '../index.css'

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
  
  useEffect(() => {
    if (categories.length > 0) return
    const fetching = async () => {
      const catsRes = await fetch(BACKEND_URL + '/trivia/categories', { method: 'GET', credentials: 'include' })
      if (!catsRes.ok) return
      const cats = await catsRes.json()
      setCategories(cats)

      const question1Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[0].category_id}`, { method: 'POST', credentials: 'include' })
      if (!question1Res.ok) return
      const question1 = await question1Res.json()
      setCurrentQuestion(question1)
      startTimer()
      setRndSortOptions([...question1.options].sort(() => Math.random() - 0.5))
      const question2Res = await fetch(BACKEND_URL + `/trivia?category_id=${cats[1].category_id}`, { method: 'POST', credentials: 'include' })
      if (!question2Res.ok) return
      const question2 = await question2Res.json()
      setNextQuestion(question2)
    }
    fetching()
  }, [categories.length])

  const handleClick = (e) => {
    if (e.target.classList.contains('disabled') || e.target.classList.contains('correct') || e.target.classList.contains('incorrect')) return
    const playedI = played.findIndex(pl => pl.category_id === currentQuestion.category_id)
    if(playedI === -1){
      setPlayed(played =>[...played, { category_id: currentQuestion.category_id, questions_id: [currentQuestion.question_id] }])
    } else setPlayed(played => {
      played[playedI].questions_id.push(currentQuestion.question_id)
      return played
    })
    if (currentQuestion.options.findIndex( option => option === e.target.textContent) === 0){
      //corecta !
      document.querySelectorAll('button').forEach(btn => btn.classList.add('disabled'))
      e.target.classList.remove('disabled')
      e.target.classList.add('correct')
      setToSend([...toSend, {question_id: currentQuestion.question_id, is_correct: true, response_time: TIME_PER_QUESTION-secondsLeft}])
      setNPlayed(nPlayed => nPlayed + 1)
    } else {
      //incorrecta
      document.querySelectorAll('button').forEach(btn => {
        if(btn.textContent === currentQuestion.options[0]) return btn.classList.add('correct')
        if(btn === e.target) return btn.classList.add('incorrect')
        btn.classList.add('disabled')
        setToSend([...toSend, {question_id: currentQuestion.question_id, is_correct: false, response_time: TIME_PER_QUESTION-secondsLeft}])
      })
      setNPlayed(nPlayed => nPlayed + 1)
    }
    if (timerRef.current) clearInterval(timerRef.current)
    }
  const getNewQuestion = async (findThisCategoryForNow)=>{
      document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('correct')
        btn.classList.remove('incorrect')
        btn.classList.remove('disabled')
      })
      setRndSortOptions([...nextQuestion.options].sort(() => Math.random() - 0.5))
      if(!findThisCategoryForNow) setCurrentQuestion(nextQuestion)
      if(nPlayed < AMMOUNT_OF_QUESTIONS) {
        let newQuestion = await fetch(BACKEND_URL + `/trivia?category_id=${findThisCategoryForNow ?? categories[(categories.findIndex(cat => cat.category_id === currentQuestion.category_id) + 1) % categories.length].category_id}`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            played
          })
        })
        if(!newQuestion.ok) return //error
        newQuestion = await newQuestion.json()
        if(findThisCategoryForNow) setCurrentQuestion(newQuestion)
        else setNextQuestion(newQuestion)
      }
      startTimer()
    }
  useEffect(() => {
    if (nPlayed <= 0) return
  
    setTimeout( () => {
      if (nPlayed === (AMMOUNT_OF_QUESTIONS - 1)) {
        
        setBonusCategory('choosing')
        
      } else getNewQuestion()
    }, 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nPlayed])
  const handleCategoryClick = (e) => {
          let findThisCategory = categories.find(cat => cat.category_name === e.target.textContent).category_id
          setBonusCategory(findThisCategory)
          document.querySelectorAll('.category-btn').forEach(btn => btn.removeEventListener('click', handleCategoryClick))
          getNewQuestion(findThisCategory)
        }
  useEffect(() => {
    if (bonusCategory !== 'choosing') return
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.addEventListener('click', handleCategoryClick)
        })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[bonusCategory])

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSecondsLeft(TIME_PER_QUESTION)
    timerRef.current = setInterval(() => {
      setSecondsLeft(seconds => {
        if (seconds > 0) {
          return seconds - 1
        } else {
          clearInterval(timerRef.current)
          return 0
        }
      })
    }, 1000)
  }
  useEffect(() => {return () => clearInterval(timerRef.current)}, [])
  useEffect(() => {
    if (nPlayed >= AMMOUNT_OF_QUESTIONS) {
      fetch(BACKEND_URL + '/trivia', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          results: toSend,
          userInfo: {
            correct: played.filter(pl => pl.is_correct === true).length,
            ammount: played.length,
            bonus_category: bonusCategory
          }
        })
      }).then(res => {
          if(!res.ok) return //error
          navigate('/gracias')
        })
    }
  }, [bonusCategory, nPlayed, navigate, played, toSend])

  return (
    <>
      <header>
        <h1>Trivia de Conocimiento General</h1>
      </header>
      <main>
        {currentQuestion.question_text && bonusCategory !== 'choosing' && (
          <>
            <h3>Tema: <span>{categories.find(cat => cat.category_id === currentQuestion.category_id).category_name}</span></h3>
            <section>
              <h2>{currentQuestion.question_text}</h2>
              <div className="btn-cont">
                {rndSortOptions.map((option, index) => { if (option === undefined || option === null) return 
                return (
                  <button key={index} onClick={handleClick}>{option}</button>
                )})}
              </div>
            </section>
            <div className="timer">
              <span>{/* tiempo = height of progress bar = secondsLeft/TIME_PER_QUESTION */}</span>
              <p>s</p>
              <div>{/* Linea de tiempo */}</div>
            </div>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>
          </>
        )}
        {bonusCategory === 'choosing' && (
          <>
            <h4>Última pregunta</h4>
            <h2>Elija una categoría</h2>
            <section>
              <div className="btn-cont">
                {categories.map((cat, index) => {
                  return (
                    <button className="category-btn"key={index}>{cat.category_name}</button>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}
