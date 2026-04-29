import React from "react"
import ResearchNav from "@modules/calilean/components/research-nav"
import type { ResearchHeading } from "@lib/mdx"

type ResearchLayoutProps = {
  headings: ResearchHeading[]
  children: React.ReactNode
}

const ResearchLayout: React.FC<ResearchLayoutProps> = ({ headings, children }) => {
  return (
    <div className="content-container py-12 border-t border-calilean-sand">
      <div className="small:flex small:gap-12">
        <ResearchNav headings={headings} />

        <div className="flex-1 min-w-0 space-y-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ResearchLayout
