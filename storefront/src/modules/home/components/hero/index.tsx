import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="py-24 small:py-32 text-center relative overflow-hidden bg-calilean-bg">
      <div className="content-container">
        <span className="inline-block bg-calilean-sand text-calilean-ink px-5 py-1.5 rounded-pill text-sm font-medium mb-8">
          Read the label.
        </span>
        <h1 className="text-5xl small:text-7xl large:text-8xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto mb-8">
          Peptides, <em className="italic">plainly labeled.</em>
        </h1>
        <p className="text-xl text-calilean-fog max-w-xl mx-auto mb-12 leading-relaxed">
          Research-grade compounds for the South Bay athlete. Third-party assayed. Batch-traceable. Sold for research use only.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center justify-center px-7 py-3 bg-calilean-sand text-calilean-ink rounded-btn font-medium text-base hover:opacity-85 transition-all hover:-translate-y-0.5"
        >
          Shop the lineup
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default Hero
