"use client"

import { useState, useEffect } from "react"
import CaliLeanLogo from "@modules/calilean/icons/calilean-logo"
import { RUO_AGE_GATE_HEADLINE, RUO_AGE_GATE_BODY } from "@lib/ruo"

const AgeGate = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("age-verified")) {
      setVisible(true)
      document.body.style.overflow = "hidden"
    }
  }, [])

  const accept = () => {
    sessionStorage.setItem("age-verified", "true")
    setVisible(false)
    document.body.style.overflow = ""
  }

  const decline = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "about:blank"
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-calilean-bg p-10 rounded-2xl text-center max-w-md w-[90%]">
        <CaliLeanLogo className="h-8 mx-auto mb-6" color="#1F2326" tracking="display" />
        <p className="text-lg font-semibold mb-2">{RUO_AGE_GATE_HEADLINE}</p>
        <p className="text-sm text-calilean-fog mb-6">{RUO_AGE_GATE_BODY}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={decline}
            className="px-6 py-2.5 border-[1.5px] border-calilean-ink rounded-btn text-sm font-medium hover:bg-calilean-ink hover:text-calilean-bg transition-colors"
          >
            Leave
          </button>
          <button
            onClick={accept}
            className="px-6 py-2.5 bg-calilean-sand text-calilean-ink rounded-btn text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgeGate
