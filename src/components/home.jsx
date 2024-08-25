import { Link } from 'react-router-dom'
import '../css/home.css'

export default function Home() {
  return (
    <>
    <div className="main-bkgc main-cont h-main-cont">
      <header className='h-header'>
        <h1 className='wc'>Investigación sobre Hábitos de Lectura y Conocimiento de Cultura General</h1>
        <h2 className='gc'>Ezequiel Mastropietro</h2>
      </header>

      
      <section className="n1 secn-bkgc h-section">
        <p>Completa una breve encuesta y mide tu conocimiento de cultura general con una trivia.</p>
        <Link className='btn' to={'/mail'}>Comenzar</Link>
      </section>
      <section className="n2 h-section">
        <p>Esta investigación busca explorar la relación entre los hábitos de lectura y el conocimiento de cultura general en alumnos de secundaria.<br />¡Tu participación es clave para comprender mejor este tema! </p>
      </section>

      <footer className='secn-bkgc h-footer'>
        <p>Para mas información puedes contactarme en <a href="mailto:emastropietro@northfield.edu.ar">emastropietro@northfield.edu.ar</a></p>
      </footer>
    </div>
    </>
  )
}
