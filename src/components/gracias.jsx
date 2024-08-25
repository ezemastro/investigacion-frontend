import { useEffect, useState } from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import "../css/gracias.css"
import { Link } from "react-router-dom"
import confetti from "canvas-confetti"

export default function Gracias() {
  const [growingScore, setGrowingScore] = useState(0)
  const [targetScore, setTargetScore] = useState(undefined)

  useEffect(() => {
    setTargetScore(localStorage.getItem("trivaScore") !== null ? localStorage.getItem("trivaScore") : undefined)
  }, [])

  useEffect(() => {
    if (targetScore === undefined) return
    const timer = setInterval(() => {
      setGrowingScore((prev) => {
        if (prev < targetScore) {
          return prev + 1
        }
        clearInterval(timer)
        confetti()
        return targetScore
      })
    }, 3000 / targetScore)
    return () => clearInterval(timer)
  }, [targetScore])


  return (
    <div className="main-cont g-main-cont main-bkgc">
      <h1>Gracias por participar</h1>
      {targetScore !== undefined && (
        <section className="g-score-sect secn-bkgc">
          <h2>Tu puntuación es:</h2>
          <div className="g-score-cont">
            <CircularProgressbar
              value={growingScore}
              text={`${growingScore}%`}
              styles={buildStyles({
                pathColor: "#2B2D42",
                textColor: "#2B2D42",
                trailColor: "#EDF2F4",
              })}
            />
          </div>
        </section>
      )}
      <Link to={"/"} className="btn d">Volver a la página principal</Link>
    </div>
  )
}
