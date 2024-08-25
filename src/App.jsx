import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/home.jsx'
import Email from './components/email.jsx'
import Encuesta from './components/encuesta.jsx'
import Trivia from './components/trivia.jsx'
import ErrorPage from './components/errorPage.jsx'
import './index.css'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
      errorElement: <ErrorPage />
    },
    {
      path: '/mail',
      element: <Email />
    },
    {
      path: '/encuesta',
      element: <Encuesta />
    },
    {
      path: '/trivia',
      element: <Trivia />
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
