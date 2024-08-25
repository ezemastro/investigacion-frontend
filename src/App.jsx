import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/home.jsx'
import Email from './components/email.jsx'
import Encuesta from './components/encuesta.jsx'
import Trivia from './components/trivia.jsx'
import ErrorPage from './components/errorPage.jsx'
import './index.css'
import Gracias from './components/gracias.jsx'
import { useState } from 'react'

function App() {

  const [loading, setLoading] = useState(false)
  const startLoading = () => {
    setLoading(true)
  }
  const stopLoading = () => {
    setLoading(false)
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
      errorElement: <ErrorPage />
    },
    {
      path: '/mail',
      element: <Email startLoading={startLoading} stopLoading={stopLoading} />
    },
    {
      path: '/encuesta',
      element: <Encuesta startLoading={startLoading} stopLoading={stopLoading} />
    },
    {
      path: '/trivia',
      element: <Trivia startLoading={startLoading} stopLoading={stopLoading} />
    },
    {
      path: '/gracias',
      element: <Gracias />
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
