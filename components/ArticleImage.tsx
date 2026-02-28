'use client'

import { useState } from 'react'

interface ArticleImageProps {
  src: string
  alt: string
  className?: string
  fallback: React.ReactNode
}

export default function ArticleImage({ src, alt, className, fallback }: ArticleImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored) return <>{fallback}</>

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
