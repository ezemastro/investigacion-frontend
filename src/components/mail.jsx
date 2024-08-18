import { Link } from 'react-router-dom'

export default function mail() {
  return (
    <>
      <h1>Ingresa tu mail</h1>
      <input type="email" id="email" />
      <Link to={"/encuesta"}>Comenzar</Link>
      <div className='df aic'>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
        <p>El mail no será almacenado, solo se usa para evitar múltiples respuestas</p>
        <img src="/src/assets/closed-eye.svg" alt="closed eye" />
      </div>
    </>
  )
}
