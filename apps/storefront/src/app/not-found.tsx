import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Metadata } from "next"
import Link from "next/link"

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
      <Link
        className="flex gap-x-1 items-center group"
        href="/store"
      >
        <Text className="text-ui-fg-interactive">Back to the lineup</Text>
        <ArrowUpRightMini
          className="group-hover:rotate-45 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
