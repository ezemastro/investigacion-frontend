import { Link } from "react-router-dom"

export default function errorPage() {
  return (
    <>
      <h1>Página no encontrada.</h1>
      <Link to={"/"}>Volver a la página principal</Link>
    </>
  )
}
