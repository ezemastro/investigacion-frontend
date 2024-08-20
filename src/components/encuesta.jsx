import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BACKEND_URL } from '../constants'
import SurveyInput from './surveyInput'

export default function Encuesta() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [ready, setReady] = useState(false)
  const [questionToSend, setQuestionToSend] = useState(undefined)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    fetch('/check', { method: 'GET' }).then(res => {
      if (res.ok) setAuthorized(true)
      else navigate('/')
    })
  }, [navigate])
  useEffect(() => {
    if (!authorized) return
    fetch(BACKEND_URL + '/survey', { method: 'GET' }).then(res => {
      if (res.ok) {
        res.json().then( q => {
          setQuestions(q)
          setQuestionToSend(q.map(q => ({
            question_id: q.question_id,
            response: undefined
          })))
        })
      }
    })
  }, [authorized])

  const semiSubmit = (ans) => {
    setQuestionToSend(prevQuestions => {
      let mdQ = [...prevQuestions];
      mdQ[currentQuestion].response = ans
      console.log(ans)
      return mdQ
    })
  }
  useEffect(() => {
    if(!questionToSend) return
    if (questionToSend.filter(q => q.response !== undefined && q.response !== null).length >= questions.length) setReady(true)
    else setReady(false)
  }, [questionToSend, questions])

  const handleNext = () => {
    if ( currentQuestion + 1 >= questions.length) return
    setCurrentQuestion(currentQuestion + 1)
  }
  const handleBack = () => {
    if (currentQuestion <= 0) return
    setCurrentQuestion(currentQuestion - 1)
  }
  const handleSend = () => {
    if (!ready) return
    fetch(BACKEND_URL + '/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questionToSend)
    }).then(res => {
      if (res.ok) navigate('/trivia')
      else setError(true) 
    }).catch(err => {
      console.log(err)
      setError(true)
    })
  }
  return (
    <>
      {!authorized && <p className='error'>No autorizado</p>}
      <header>
        <h1>Encuesta sobre hábitos de lectura</h1>
      </header>
      <main>
        <section>
          {authorized && questions && currentQuestion < questions.length && (
            <>
              <h2>{questions[currentQuestion].question_text}</h2>
              <SurveyInput question={questions[currentQuestion]} semiSubmit={semiSubmit} defAnswer={questionToSend[currentQuestion].response} currentQuestion={currentQuestion}/>
              <div className="progress-cont">
                <div id="progress" style={{ position: 'relative' }}>
                  <div id="progress-track" style={{ width: `${(questionToSend.filter(q => q.response !== undefined || q.response !== null).length / questions.length) * 100}%`, position: 'absolute' }}></div>
                </div>
                <div className="progress-btn-cont">
                  <button onClick={handleBack}><img src="../assets/arrow.svg" alt="arrow" style={{ transform: 'rotate(180deg)' }} /></button>
                  <p>{currentQuestion + 1} / {questions.length}</p>
                  <button onClick={handleNext}><img src="../assets/arrow.svg" alt="arrow" /></button>
                </div>
              </div>
            </>
          )}
        </section>
        <section>
          <button onClick={handleSend} className={!ready ? 'disabled' : ''}>Enviar</button>
          {error && <p className='error'>Error al enviar encuesta</p>}
        </section>
      </main>
    </>
  )
}
