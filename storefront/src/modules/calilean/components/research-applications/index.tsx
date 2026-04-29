import React from "react"

type ApplicationProps = {
  title: string
  children: React.ReactNode
}

export const Application: React.FC<ApplicationProps> = ({ title, children }) => {
  return (
    <div className="rounded-lg border border-calilean-sand bg-white p-4">
      <h4 className="text-sm font-semibold text-calilean-ink mb-2">{title}</h4>
      <div className="text-sm text-calilean-fog leading-relaxed">{children}</div>
    </div>
  )
}

type ResearchApplicationsProps = {
  children: React.ReactNode
}

const ResearchApplications: React.FC<ResearchApplicationsProps> = ({ children }) => {
  return (
    <section id="research-applications" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Research Applications
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  )
}

export default ResearchApplications
