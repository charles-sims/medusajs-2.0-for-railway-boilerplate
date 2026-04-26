import { RUO_DISCLAIMER_LONG } from "@lib/ruo"

const ResearchDisclaimer = () => {
  return (
    <div
      role="note"
      aria-label="Research use only disclaimer"
      data-ruo-disclaimer="long"
      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
    >
      <p className="text-xs font-bold text-amber-800 mb-1">RESEARCH USE ONLY</p>
      <p className="text-xs text-stone-500 leading-relaxed">
        {RUO_DISCLAIMER_LONG}
      </p>
    </div>
  )
}

export default ResearchDisclaimer
