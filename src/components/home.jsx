import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
    <div className="main-bkgc main-cont">
      <header className='df jcc aic fdc tac g15px p30 mw'>
        <h1 className='wc'>Investigación sobre Hábitos de Lectura y Conocimiento de Cultura General</h1>
        <h2 className='gc'>Ezequiel Mastropietro</h2>
      </header>

      <main className=''>
        <section className="1 secn-bkgc df jcc aic fdc p30 fs20 g15px mw tac">
          <p>Completa una breve encuesta y mide tu conocimiento de cultura general con una trivia.</p>
          <Link className='btn' to={'/mail'}>Comenzar</Link>
        </section>
        <section className="2 df jcc aic fdc p30 fs10 g15px mw tac">
          <p>Esta investigación busca explorar la relación entre los hábitos de lectura y el conocimiento de cultura general en alumnos de secundaria.<br />¡Tu participación es clave para comprender mejor este tema! </p>
        </section>
      </main>

      <footer className='secn-bkgc'>
        <p>Para mas información puedes contactarme en <a href="mailto:emastropietro@northfield.edu.ar">emastropietro@northfield.edu.ar</a></p>
      </footer>
    </div>
    </>
  )
}
