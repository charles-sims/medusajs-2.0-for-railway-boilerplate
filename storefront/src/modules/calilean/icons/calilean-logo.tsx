import Image from "next/image"

type CaliLeanLogoProps = {
  className?: string
  color?: "black" | "white"
}

const CaliLeanLogo = ({
  className = "",
  color = "black",
}: CaliLeanLogoProps) => {
  const src =
    color === "white"
      ? "/brand/logo/calilean-logo-white.png"
      : "/brand/logo/calilean-logo-black.png"

  return (
    <Image
      src={src}
      alt="CaliLean"
      width={600}
      height={120}
      className={className}
      priority
    />
  )
}

export default CaliLeanLogo
