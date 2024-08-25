/* eslint-disable react/prop-types */
import Slider from "./slider.jsx"
import { useEffect } from "react"
import '../index.css'

export default function SurveyInput({ question, semiSubmit, defAnswer, currentQuestion }) {
  const { response_type, options } = question
  const handleClick = (e) => {
    semiSubmit(e.target.id)

    if(!document.querySelector(".multiple-choice-button")) return
    document.querySelectorAll(".multiple-choice-button").forEach((button) => {
      if (button === e.target) button.classList.add("selected")
      else button.classList.remove("selected")
    })
  }

  useEffect(() => {
    if(!defAnswer) return
    if (response_type === "text") {
      document.getElementById("input").value = defAnswer
      document.getElementById("input").focus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  const handleKey = (e) => {
    semiSubmit(e.target.value)
  }

  return (
    <>
      {response_type === "slider" && (
        <div className="slider-cont">
    <span style={{position: "absolute", top: "-65px",left: "50%", width: "100%", textAlign: "center", transform: "translateX(-50%)", cursor: "default", opacity: defAnswer === undefined ? 1 : 0, transition: "all 0.5s ease-out"}}>*Arrastra el deslizador</span>
          <label>{options[0]}</label>
          <Slider semiSubmit={semiSubmit} defAnswer={defAnswer} currentQuestion={currentQuestion} />
          <label>{options[1]}</label>
        </div>
      )}
      {response_type === "text" && <input type="text" placeholder="Escribe tu respuesta" onKeyUp={handleKey} id="input" />}
      {response_type === "multiple_choice" && (
        <div className="multiple-choice-cont">
          <div className="firsts">
          {options.map((option, index) => index<2 &&(
            <button className={`multiple-choice-button ${index + 1 == defAnswer ? "selected" : ""}`} onClick={handleClick} key={currentQuestion*10+index} id={index + 1} >
              {option}
            </button>
          ))}
          </div>
          {options.filter(option => option).length > 2 && (<div className="seconds">
          {options.map((option, index) => index>1 && option &&(
            <button className={`multiple-choice-button ${index + 1 == defAnswer ? "selected" : ""}`} onClick={handleClick} key={index} id={index + 1} >
              {option}
            </button>
          ))}
          </div>)}
        </div>
      )}
    </>
  )
}
