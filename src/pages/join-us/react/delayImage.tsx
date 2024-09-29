import React, { useState, useEffect } from "react"

interface DelayImageProps {
  src: string
  alt: string
  delay: number // delay in milliseconds
}

const DelayImage: React.FC<DelayImageProps> = ({ src, alt, delay }) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div>{loaded ? <img src={src} alt={alt} /> : <p>Loading image...</p>}</div>
  )
}

export default DelayImage
