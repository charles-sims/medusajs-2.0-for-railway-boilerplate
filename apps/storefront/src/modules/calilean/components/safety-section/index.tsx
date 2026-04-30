import React from "react"

type SafetyProps = {
  children: React.ReactNode
}

const Safety: React.FC<SafetyProps> = ({ children }) => {
  return (
    <section id="safety-handling" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Safety &amp; Handling
      </h2>
      <div className="rounded-lg border border-amber-200/60 bg-amber-50/30 p-4">
        <div className="text-sm text-calilean-fog leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </section>
  )
}

export const SafetyFallback: React.FC = () => {
  return (
    <Safety>
      <p>
        Handle with appropriate personal protective equipment (PPE) including gloves
        and eye protection. Store lyophilized product at -20°C. Reconstituted solutions
        should be stored at 2-8°C and used within the recommended timeframe.
      </p>
      <p>
        Refer to the Certificate of Analysis and Safety Data Sheet for complete
        storage, handling, and disposal guidance specific to this compound.
      </p>
    </Safety>
  )
}

export default Safety
