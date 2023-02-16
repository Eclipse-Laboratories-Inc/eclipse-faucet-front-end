import { useEffect, useMemo, useRef, useState } from 'react'

export const CircleTimer = (props) => {
  const {
    className = '',
    size = 36,
    playing = false,
    duration = 6,
    isError = false
  } = props

  const [current, setCurrent] = useState(0)
  const circumference = size * Math.PI
  const radius = size / 2
  const milliseconds = duration * 1000
  const interval = useRef(null)

  const strokeDashoffset = useMemo(() => {
    return circumference - (current / milliseconds) * circumference
  }, [current, milliseconds, circumference])
  useEffect(() => {
    if (playing === true) {
      interval.current = setInterval(() => {
        setCurrent((prev) => prev - 10)
      }, 10)
    } else {
      clearInterval(interval.current)
    }
    // eslint-disable-next-line
  }, [playing])

  return <div
    className={`circle-timer ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}>
    <svg>
      <circle
        className='stroke-transparent'
        cx={radius}
        cy={radius}
        r={radius}
        fill='none'
        strokeWidth={6}
      ></circle>
    </svg>
    {playing ? (
      <svg>
        <circle
          strokeDasharray={circumference}
          strokeDashoffset={playing ? strokeDashoffset : 0}
          className={`${!isError ? 'stroke-green' : 'stroke-red'}`}
          r={radius}
          cx={radius}
          cy={radius}
          fill='none'
          strokeLinecap='round'
          strokeWidth={3}
        ></circle>
      </svg>
    ) : null}
  </div>
}
