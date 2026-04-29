import React from "react"

type Step = {
  label: string
  type: "input" | "pathway" | "output"
}

type MechanismDiagramProps = {
  steps: Step[]
}

const stepStyles: Record<Step["type"], string> = {
  input: "border-calilean-ink bg-calilean-bg text-calilean-ink font-semibold",
  pathway: "border-calilean-sand bg-calilean-bg text-calilean-fog",
  output: "border-[#7090AB] bg-[#7090AB]/10 text-[#7090AB] font-semibold",
}

const MechanismDiagram: React.FC<MechanismDiagramProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null

  return (
    <div className="my-6 rounded-lg border border-calilean-sand bg-calilean-bg p-5">
      <p className="text-[10px] uppercase tracking-widest text-calilean-fog mb-4">
        Signaling Pathway
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden small:flex items-center justify-center gap-3 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-calilean-fog/40 text-lg select-none">&rarr;</span>
            )}
            <span
              className={`inline-flex items-center px-4 py-2.5 rounded-full border text-xs ${stepStyles[step.type]}`}
            >
              {step.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex small:hidden flex-col items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-calilean-fog/40 text-lg select-none">&darr;</span>
            )}
            <span
              className={`inline-flex items-center px-4 py-2.5 rounded-full border text-xs ${stepStyles[step.type]}`}
            >
              {step.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default MechanismDiagram
