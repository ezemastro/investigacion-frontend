import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/home.jsx'
import Mail from './components/mail.jsx'
import ErrorPage from './components/errorPage.jsx'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
      errorElement: <ErrorPage />
    },
    {
      path: '/mail',
      element: Mail()
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
