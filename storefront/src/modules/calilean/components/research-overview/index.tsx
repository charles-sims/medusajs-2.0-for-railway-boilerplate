import React from "react"

type OverviewProps = {
  children: React.ReactNode
}

const Overview: React.FC<OverviewProps> = ({ children }) => {
  return (
    <section id="overview" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Overview
      </h2>
      <div className="text-sm text-calilean-fog leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  )
}

export default Overview
