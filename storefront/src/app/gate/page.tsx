"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CaliLeanLogo from "@modules/calilean/icons/calilean-logo"
import { login, signup } from "@lib/data/customer"

type GateView = "sign-in" | "register"

export default function GatePage() {
  const [view, setView] = useState<GateView>("sign-in")

  return (
    <div className="min-h-screen bg-calilean-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[380px] text-center">
        <CaliLeanLogo className="h-20 w-auto mx-auto mb-4" color="black" />
        <p className="text-calilean-fog text-sm mb-8">Sequenced for results.</p>
        <h1 className="text-calilean-ink text-2xl font-semibold mb-8">
          Enter.
        </h1>

        {view === "sign-in" ? (
          <SignInForm onSwitch={() => setView("register")} />
        ) : (
          <RegisterForm onSwitch={() => setView("sign-in")} />
        )}
      </div>
    </div>
  )
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter()
  const [message, formAction] = useActionState(login, null)

  useEffect(() => {
    if (message === undefined) {
      router.push("/")
      router.refresh()
    }
  }, [message, router])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
      />
      {message && typeof message === "string" && (
        <p className="text-calilean-alert text-xs">{message}</p>
      )}
      <button
        type="submit"
        className="w-full bg-calilean-pacific text-white rounded-btn py-3 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Sign in
      </button>
      <p className="text-calilean-fog text-xs mt-4">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-calilean-pacific underline"
        >
          Create an account
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter()
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [message, formAction] = useActionState(signup, null)

  useEffect(() => {
    if (message && typeof message !== "string") {
      router.push("/")
      router.refresh()
    }
  }, [message, router])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          name="first_name"
          type="text"
          placeholder="First name"
          required
          autoComplete="given-name"
          className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
        />
        <input
          name="last_name"
          type="text"
          placeholder="Last name"
          required
          autoComplete="family-name"
          className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone"
        autoComplete="tel"
        className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="new-password"
        className="w-full bg-calilean-sand rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog outline-none focus:ring-2 focus:ring-calilean-pacific/30"
      />
      <label className="flex items-start gap-2 text-left mt-2">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-0.5 accent-calilean-pacific"
          required
        />
        <span className="text-xs text-calilean-fog leading-relaxed">
          I confirm I am 21 or older and agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            className="text-calilean-pacific underline"
          >
            Terms of Service
          </a>
          .
        </span>
      </label>
      {message && typeof message === "string" && (
        <p className="text-calilean-alert text-xs">{message}</p>
      )}
      <button
        type="submit"
        disabled={!ageConfirmed}
        className="w-full bg-calilean-pacific text-white rounded-btn py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create account
      </button>
      <p className="text-calilean-fog text-xs mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-calilean-pacific underline"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
