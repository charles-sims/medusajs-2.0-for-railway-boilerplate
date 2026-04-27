import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CaliLeanLogo from "@modules/calilean/icons/calilean-logo"
import RUODisclaimer from "@modules/common/components/ruo-disclaimer"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="bg-calilean-coa text-white">
      <div className="content-container py-16">
        <div className="grid grid-cols-1 small:grid-cols-4 gap-12">
          <div className="small:col-span-1">
            <CaliLeanLogo className="h-7 mb-4" color="#ffffff" tracking="display" />
            <p className="text-sm text-white/60 leading-relaxed">
              Research-grade peptides, built in the South Bay. Every batch independently tested. Every COA published. Sold for research use only.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><LocalizedClientLink href="/store" className="text-sm text-white/80 hover:text-white transition-colors">All Peptides</LocalizedClientLink></li>
              {collections?.slice(0, 4).map((c) => (
                <li key={c.id}><LocalizedClientLink href={`/collections/${c.handle}`} className="text-sm text-white/80 hover:text-white transition-colors">{c.title}</LocalizedClientLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><LocalizedClientLink href="/store" className="text-sm text-white/80 hover:text-white transition-colors">About Us</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/store" className="text-sm text-white/80 hover:text-white transition-colors">Contact</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/account" className="text-sm text-white/80 hover:text-white transition-colors">My Account</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/terms" className="text-sm text-white/80 hover:text-white transition-colors">Terms of Service</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">Privacy Policy</LocalizedClientLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-white/80">research@calilean.bio</span></li>
              <li><span className="text-sm text-white/80">support@calilean.bio</span></li>
              <li><span className="text-sm text-white/80">Mon-Fri 9AM-5PM PT</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <RUODisclaimer
            variant="short"
            className="text-xs text-white/60 bg-transparent border-0 px-0 py-0 max-w-2xl mx-auto"
          />
          <Text className="text-xs text-white/40 mt-3">
            &copy; {new Date().getFullYear()} CaliLean. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
