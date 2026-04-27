import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Need help?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <a href="mailto:research@calilean.bio">research@calilean.bio</a>
          </li>
          <li>Returns within 30 days. Sealed, unopened vials only.</li>
        </ul>
      </div>
    </div>
  )
}

export default Help
