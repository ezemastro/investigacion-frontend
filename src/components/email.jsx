/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { z } from 'zod'
import { BACKEND_URL } from '../constants.js'
import '../css/email.css'
import Loading from './loading.jsx'

export default function Email() {
  const [loading, setLoading] = useState(false)
  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)
  
  const navigate = useNavigate()
  const [correctEmail, setCorrectEmail] = useState(undefined)
  const [correctAge, setCorrectAge] = useState(undefined)
  const [error, setError] = useState(undefined)
  const emailRef = useRef(null)
  const ageRef = useRef(null)
  
  const emailSchema = z.string().email()
  const ageSchema = z.number().min(0).max(120)
  const handleSubmit = () => {
    const email = document.getElementById('email').value
    const emailResult = emailSchema.safeParse(email)
    const age = parseInt(document.getElementById('age').value)
    const ageResult = ageSchema.safeParse(age)

    if(!emailResult.success || !ageResult.success){
      if (!ageResult.success) {
        setCorrectAge(false)
        ageRef.current.focus()
      }
      else setCorrectAge(true)
      if (!emailResult.success){
        setCorrectEmail(false)
        emailRef.current.focus()}
      else setCorrectEmail(true)
      return
    }  

    startLoading()
    fetch( BACKEND_URL + '/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({email, age}),
    }).then(res => {
      if (res.status >= 200 && res.status < 300){
        stopLoading()
        console.log("navigating")
        navigate('/encuesta')
      }
      else {
        stopLoading()
        setError(res.status)
      }
    }).catch(err => {
      stopLoading()
      console.log(err)
    })
  }
  const handleSubmitKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <>
    {loading && <Loading />}
    <div className="e-main-cont main-cont main-bkgc">
      <h1 className="e-h1">Ingrese su correo electrónico y su edad</h1>
      <div className="e-inputs-cont">
      <div className={`e-input-cont email ${correctEmail === true ? 'ok' : correctEmail === false ? 'notok' : ''}`}>
        <input className='e-input' type="email" placeholder="Correo electrónico" id="email" ref={emailRef} onKeyDown={handleSubmitKey} />
        <img className="check" src="/src/assets/check.svg" alt="check" />
        <img className="cross" src="/src/assets/cross.svg" alt="cross" />
      </div>
      <div className={`e-input-cont age ${correctAge === true ? 'ok' : correctAge === false ? 'notok' : ''}`}>
        <input className='e-input' type="number" placeholder='Edad' id="age" ref={ageRef} onKeyDown={handleSubmitKey} />
        <img className="check" src="/src/assets/check.svg" alt="check" />
        <img className="cross" src="/src/assets/cross.svg" alt="cross" />
      </div>
      </div>
      {error && error !== 409 && <p className="error">Se ha producido un error, vuelva a intentarlo</p>}
      {error === 409 && <p className="error">Ya ha completado la encuesta</p>}

      <button className='e-btn btn d' onClick={handleSubmit}>Comenzar</button>
      <div className='e-info'>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
        <p>La dirección de correo electrónico no será almacenado, solo se usa para evitar múltiples respuestas</p>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
      </div>
      </div>
    </>
  )
}
