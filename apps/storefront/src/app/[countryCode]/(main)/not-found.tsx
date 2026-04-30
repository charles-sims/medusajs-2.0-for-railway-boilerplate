import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "Not found | CaliLean",
  description: "This page isn't on the shelf.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">This page isn&apos;t on the shelf.</h1>
      <p className="text-small-regular text-ui-fg-base">
        Try the lineup, or read the lab notebook.
      </p>
      <InteractiveLink href="/store">Back to the lineup</InteractiveLink>
    </div>
  )
}
