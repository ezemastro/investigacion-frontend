/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'

export default function Slider({ semiSubmit, defAnswer, currentQuestion }) {
  const [position, setPosition] = useState(50)
  const [sliderBoundingClientRect, setSliderBoundingClientRect] = useState(undefined)

  useEffect(() => {
    setSliderBoundingClientRect(document.getElementById('slider').getBoundingClientRect())
  }, [])

  useEffect(() => {
    setPosition(defAnswer === undefined ? 50 : defAnswer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  const handleMouseMove = (e) => {
    const offsetX = e.clientX - sliderBoundingClientRect.left
    const newPosition = Math.max(0, Math.min(offsetX, sliderBoundingClientRect.width))
    setPosition(newPosition / sliderBoundingClientRect.width * 100)
  }
  const handleMouseDown = (e) => {
    setPosition(Math.max(0, Math.min(e.clientX - sliderBoundingClientRect.left, sliderBoundingClientRect.width)) / sliderBoundingClientRect.width * 100)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
const handleMouseUp = (e) => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    semiSubmit(Math.max(0, Math.min(e.clientX - sliderBoundingClientRect.left, sliderBoundingClientRect.width)) / sliderBoundingClientRect.width * 100)
  }
  return (
    <>
    <div id='slider' onMouseDown={handleMouseDown}>
      <div className="slider-thumb" style={{ left: `${position}%`, backgroundColor: defAnswer === undefined ? '#EDF2F4' : '#2B2D42'}}></div>
    </div>
    </>
  )
}
