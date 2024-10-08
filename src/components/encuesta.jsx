/* eslint-disable react/prop-types */
import { redirect, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BACKEND_URL } from '../constants'
import SurveyInput from './surveyInput'
import '../css/encuesta.css'
import Loading from './loading'

export default function Encuesta() {
  const [loading, setLoading] = useState(false)
  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)

  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [ready, setReady] = useState(false)
  const [questionToSend, setQuestionToSend] = useState(undefined)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    startLoading()
    const stringedId = localStorage.getItem('id')
    const id = stringedId ? JSON.parse(stringedId) : undefined
    fetch(BACKEND_URL + '/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(res => {
      stopLoading()
      if (res.ok) {
        res.json().then( q => {
          setQuestions(q)
          setQuestionToSend(q.map(q => ({
            question_id: q.question_id,
            response: undefined
          })))
        })
      } else {
        res.json().then(err => {
          err?.redirect && navigate(err.redirect)
        })
        return setError(true)
      }
    }).catch(err => {
      stopLoading()
      console.log(err)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const semiSubmit = (ans) => {
    setQuestionToSend(prevQuestions => {
      let mdQ = [...prevQuestions];
      mdQ[currentQuestion].response = typeof ans === 'number' ? Math.round(ans) : ans
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
    startLoading()
    const stringedId = localStorage.getItem('id')
    const id = stringedId ? JSON.parse(stringedId) : undefined
    fetch(BACKEND_URL + '/survey/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, survey: questionToSend})
    }).then(res => {
      stopLoading()
      if (!res.ok) {
        res.json().then( err => {
          err?.redirect && redirect(err.redirect)
        })
      } else navigate('/trivia')
    }).catch((err) => {
      stopLoading()
      console.log(err)
    })
  }
  return (
    <>
    {loading && <Loading />}
    <div className="en-main-cont main-cont main-bkgc">
      <header className='en-header'>
        <h1>Encuesta sobre hábitos de lectura</h1>
      </header>
      <main className='en-main'>
        <section className='secn-bkgc en-section n1'>
          {questions && currentQuestion < questions.length && (
            <>
              <h2>{questions[currentQuestion].question_text}</h2>
              <SurveyInput question={questions[currentQuestion]} semiSubmit={semiSubmit} defAnswer={questionToSend[currentQuestion].response} currentQuestion={currentQuestion}/>
              <div className="progress-cont">
                <div id="progress">
                  <div id="progress-track" style={{ width: `${(questionToSend.filter(q => q.response !== undefined && q.response !== null).length / questions.length) * 100}%`}}></div>
                </div>
                <div className="progress-btn-cont">
                  <button onClick={handleBack} className={`${currentQuestion <= 0 ? 'disabled' : ''}`}><img src="assets/arrow.svg" alt="arrow" style={{ transform: 'rotate(180deg)' }} /></button>
                  <p>{currentQuestion + 1} / {questions.length}</p>
                  <button onClick={handleNext} className={`${currentQuestion === questions.length - 1 ? 'disabled' : ''}`}><img src="assets/arrow.svg" alt="arrow" /></button>
                </div>
              </div>
            </>
          )}
        </section>
        <section className='en-section n2'>
          <button onClick={handleSend} className={`btn en-btn d ${!ready ? 'disabled' : ''}`}>Enviar</button>
          {error && <p className='error'>Error al enviar encuesta</p>}
        </section>
      </main>
      <footer></footer>
    </div>
    </>
  )
}
