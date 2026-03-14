import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="py-24 small:py-32 text-center relative overflow-hidden bg-bluum-bg">
      <div className="content-container">
        <span className="inline-block bg-bluum-primary text-bluum-text px-5 py-1.5 rounded-pill text-sm font-medium mb-8">
          Verified Purity &amp; US Shipping
        </span>
        <h1 className="text-5xl small:text-7xl large:text-8xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto mb-8">
          Research-Grade Peptides, <em className="italic">delivered</em>
        </h1>
        <p className="text-xl text-bluum-muted max-w-xl mx-auto mb-12 leading-relaxed">
          Lab-tested before they hit your lab. Your research starts with ours.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center justify-center px-7 py-3 bg-bluum-primary text-bluum-text rounded-btn font-medium text-base hover:opacity-85 transition-all hover:-translate-y-0.5"
        >
          Shop Peptides
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default Hero
