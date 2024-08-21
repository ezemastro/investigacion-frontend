import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { z } from 'zod'
import { BACKEND_URL } from '../constants.js'

export default function Mail() {
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
    fetch( BACKEND_URL + '/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({email, age}),
    }).then(res => {
      if (res.status >= 200 && res.status < 300) return navigate('/encuesta')
      else setError(res.status)
    }).catch(err => console.log(err))
  }
  const handleSubmitKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <>
      <h1>Ingrese su mail y su edad</h1>
      <div className="input-cont">
        <input type="email" id="email" ref={emailRef} onKeyDown={handleSubmitKey} />
        {correctEmail === true && <img src="/src/assets/check.svg" alt="check" />}
        {correctEmail === false && <img src="/src/assets/cross.svg" alt="cross" />}
      </div>
      <div className="input-cont">
        <input type="number" id="age" ref={ageRef} onKeyDown={handleSubmitKey} />
        {correctAge === true && <img src="/src/assets/check.svg" alt="check" />}
        {correctAge === false && <img src="/src/assets/cross.svg" alt="cross" />}
      </div>

      <button className='btn' onClick={handleSubmit}>Comenzar</button>
      {error !== 409 && <p className="error">Se ha producido un error, vuelva a intentarlo</p>}
      {error === 409 && <p className="error">Ya ha completado la encuesta</p>}
      <div className='df aic'>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
        <p>El mail no será almacenado, solo se usa para evitar múltiples respuestas</p>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
      </div>
    </>
  )
}
