"use client"

import { Heading, Text } from "@medusajs/ui"

export default function GlobalError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 text-center">
      <Heading level="h1" className="text-2xl mb-4">
        Something broke on our end.
      </Heading>
      <Text className="text-calilean-fog max-w-md">
        Refresh, or try again in a minute. If it persists, email{" "}
        <a
          href="mailto:research@calilean.com"
          className="text-calilean-pacific underline"
        >
          research@calilean.com
        </a>
        .
      </Text>
    </div>
  )
}
