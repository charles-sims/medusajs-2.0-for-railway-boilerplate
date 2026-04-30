import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "Cart not found | CaliLean",
  description: "We can't find that cart.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">We can&apos;t find that cart.</h1>
      <p className="text-small-regular text-ui-fg-base">
        Your session may have ended. Start a new cart from the lineup.
      </p>
      <InteractiveLink href="/store">Back to the lineup</InteractiveLink>
    </div>
  )
}
