const BluumLogo = ({ className = "", color = "currentColor" }: { className?: string; color?: string }) => {
  return (
    <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="0" y="20" fontFamily="Switzer, sans-serif" fontSize="22" fontWeight="700" fill={color}>
        bluum
      </text>
    </svg>
  )
}

export default BluumLogo
