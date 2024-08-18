import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Encuesta() {
  const [ready, setReady] = useState(false)

  return (
    <>
      <header>
        <h1>Encuesta sobre hábitos de lectura</h1>
      </header>
      <main>
        <section>
          {/* pregunta */}
        </section>
        <section>
          <Link to={'/trivia'}>Enviar</Link>
        </section>
      </main>
    </>
  )
}
