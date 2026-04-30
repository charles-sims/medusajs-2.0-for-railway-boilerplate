import React from "react"
import Image from "next/image"
import fs from "fs"
import path from "path"

type MolecularStructureProps = {
  src: string
}

const MolecularStructure: React.FC<MolecularStructureProps> = ({ src }) => {
  const svgPath = path.join(process.cwd(), "public", "research", "structures", `${src}.svg`)
  if (!fs.existsSync(svgPath)) return null

  return (
    <div className="float-right ml-6 mb-4 w-[140px] shrink-0">
      <div className="border border-calilean-sand rounded-lg p-4 bg-calilean-bg">
        <Image
          src={`/research/structures/${src}.svg`}
          alt={`${src} molecular structure`}
          width={120}
          height={120}
          className="w-full h-auto"
        />
      </div>
      <p className="text-[10px] text-calilean-fog text-center mt-1">Molecular Structure</p>
    </div>
  )
}

export default MolecularStructure
