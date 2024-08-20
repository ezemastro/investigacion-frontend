/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'

export default function Slider({ semiSubmit, defAnswer, currentQuestion }) {
  const [position, setPosition] = useState(0)
  const [sliderBoundingClientRect, setSliderBoundingClientRect] = useState(undefined)

  useEffect(() => {
    setSliderBoundingClientRect(document.getElementById('slider').getBoundingClientRect())
  }, [])

  useEffect(() => { 
    console.log(defAnswer)
    setPosition(defAnswer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  const handleMouseMove = (e) => {
    const offsetX = e.clientX - sliderBoundingClientRect.left
    const newPosition = Math.max(0, Math.min(offsetX, sliderBoundingClientRect.width))
    setPosition(newPosition / sliderBoundingClientRect.width * 100)
  }
  const handleMouseDown = (e) => {
    setPosition(Math.max(0, Math.min(e.clientX - sliderBoundingClientRect.left, sliderBoundingClientRect.width)))
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
const handleMouseUp = (e) => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    semiSubmit(Math.max(0, Math.min(e.clientX - sliderBoundingClientRect.left, sliderBoundingClientRect.width)))
  }
  return (
    <div id='slider' style={{ width: '100px', height: '10px', backgroundColor: 'lightgray', position: 'relative' }} onMouseDown={handleMouseDown}>
      <div className="slider-thumb" style={{ left: `${position}%`, top:'50%', width: '10px', height: '50px', backgroundColor: 'red', position: 'absolute', transform: 'translate(-50%, -50%)' }}></div>
    </div>
  )
}
