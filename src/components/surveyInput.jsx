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
      console.log(defAnswer)
      document.getElementById("input").value = defAnswer
      document.getElementById("input").focus()
    }
    if(!document.querySelector(".multiple-choice-button")) return
    document.querySelectorAll(".multiple-choice-button").forEach((button) => {
      if (button.id === defAnswer) button.classList.add("selected")
      else button.classList.remove("selected")
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  const handleKey = (e) => {
    semiSubmit(e.target.value)
  }

  return (
    <>
      {response_type === "slider" && (
        <div className="slider-cont">
          <label>{options[0]}</label>
          <Slider semiSubmit={semiSubmit} defAnswer={defAnswer} currentQuestion={currentQuestion} />
          <label>{options[1]}</label>
        </div>
      )}
      {response_type === "text" && <input type="text" onKeyUp={handleKey} id="input" />}
      {response_type === "multiple_choice" && (
        <div className="multiple-choice-cont">
          {options.map((option, index) => (
            <button className="multiple-choice-button" onClick={handleClick} key={index} id={index + 1} >
              {option}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
