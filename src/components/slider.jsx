import { useEffect, useState } from 'react'

export default function Slider({ semiSubmit, defAnswer, currentQuestion }) {
  const [position, setPosition] = useState(50)
  const [sliderBoundingClientRect, setSliderBoundingClientRect] = useState(undefined)

  useEffect(() => {
    setSliderBoundingClientRect(document.getElementById('slider').getBoundingClientRect())
  }, [])

  useEffect(() => {
    setPosition(defAnswer === undefined ? 50 : defAnswer)
  }, [currentQuestion])

  const handleMove = (clientX) => {
    const offsetX = clientX - sliderBoundingClientRect.left
    const newPosition = Math.max(0, Math.min(offsetX, sliderBoundingClientRect.width))
    setPosition(newPosition / sliderBoundingClientRect.width * 100)
  }

  const handleMouseMove = (e) => {
    handleMove(e.clientX)
  }

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX)
  }

  const handleMouseDown = (e) => {
    handleMove(e.clientX)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e) => {
    handleMove(e.touches[0].clientX)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  const handleMouseUp = (e) => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    semiSubmit(position)
  }

  const handleTouchEnd = (e) => {
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    semiSubmit(position)
  }

  return (
    <div id='slider' onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      <div className="slider-thumb" style={{ left: `${position}%`, backgroundColor: defAnswer === undefined ? '#EDF2F4' : '#2B2D42' }}></div>
    </div>
  )
}
