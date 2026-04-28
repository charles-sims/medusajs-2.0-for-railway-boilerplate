"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CaliLeanLogo from "@modules/calilean/icons/calilean-logo"
import { login, signup } from "@lib/data/customer"

type GateView = "sign-in" | "register"

export default function GatePage() {
  const [view, setView] = useState<GateView>("sign-in")

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-white overflow-hidden">
      {/* Animated mesh gradient aura */}
      <style jsx>{`
        @keyframes meshMove {
          0% {
            background-position: 0% 50%, 100% 50%, 50% 100%;
          }
          25% {
            background-position: 100% 0%, 0% 100%, 80% 20%;
          }
          50% {
            background-position: 50% 100%, 50% 0%, 0% 50%;
          }
          75% {
            background-position: 0% 100%, 100% 0%, 20% 80%;
          }
          100% {
            background-position: 0% 50%, 100% 50%, 50% 100%;
          }
        }
      `}</style>

      {/* Primary aura layer — bold */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 0% 50%, rgba(112,144,171,0.45) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 100% 50%, rgba(112,144,171,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(112,144,171,0.30) 0%, transparent 50%)
          `,
          backgroundSize: "200% 200%, 200% 200%, 200% 200%",
          animation: "meshMove 30s ease-in-out infinite",
        }}
      />

      {/* Secondary layer for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 70% at 70% 30%, rgba(112,144,171,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 30% 70%, rgba(112,144,171,0.20) 0%, transparent 50%)
          `,
          backgroundSize: "200% 200%",
          animation: "meshMove 45s ease-in-out infinite reverse",
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-10 left-10 hidden small:block">
        <div className="w-[100px] h-[1px] bg-gradient-to-r from-[#7090AB]/40 to-transparent" />
        <div className="w-[1px] h-[100px] bg-gradient-to-b from-[#7090AB]/40 to-transparent" />
      </div>
      <div className="absolute bottom-10 right-10 hidden small:flex flex-col items-end">
        <div className="w-[1px] h-[100px] bg-gradient-to-t from-[#7090AB]/40 to-transparent ml-auto" />
        <div className="w-[100px] h-[1px] bg-gradient-to-l from-[#7090AB]/40 to-transparent" />
      </div>

      <div className="w-full max-w-[480px] text-center relative z-10">
        {/* Logo */}
        <div className="w-[340px] small:w-[420px] mx-auto overflow-hidden">
          <div className="-my-[30%]">
            <CaliLeanLogo className="w-full h-auto" color="black" />
          </div>
        </div>

        <p className="text-[#7090AB] text-[13px] uppercase tracking-[0.2em] font-medium mt-8 mb-8">
          Sequenced for results
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-[#7090AB]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#7090AB]" />
          <div className="w-8 h-[1.5px] bg-gradient-to-l from-transparent to-[#7090AB]" />
        </div>

        <h1 className="text-calilean-ink text-[28px] font-semibold tracking-tight mb-10">
          Enter.
        </h1>

        <div className="max-w-[340px] mx-auto relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#7090AB]/20 via-transparent to-[#7090AB]/10 pointer-events-none" />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 relative">
            {view === "sign-in" ? (
              <SignInForm onSwitch={() => setView("register")} />
            ) : (
              <RegisterForm onSwitch={() => setView("sign-in")} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-[#7090AB]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#7090AB]" />
          <div className="w-8 h-[1.5px] bg-gradient-to-l from-transparent to-[#7090AB]" />
        </div>
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
        className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
      />
      {message && typeof message === "string" && (
        <p className="text-calilean-alert text-xs">{message}</p>
      )}
      <button
        type="submit"
        className="w-full bg-calilean-pacific text-white rounded-btn py-3 text-sm font-medium hover:bg-calilean-pacific/90 transition-colors mt-1"
      >
        Sign in
      </button>
      <p className="text-calilean-fog text-xs mt-6">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-calilean-pacific hover:text-calilean-pacific/80 transition-colors"
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
          className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
        />
        <input
          name="last_name"
          type="text"
          placeholder="Last name"
          required
          autoComplete="family-name"
          className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone"
        autoComplete="tel"
        className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="new-password"
        className="w-full bg-calilean-sand border border-transparent rounded-btn px-4 py-3 text-sm text-calilean-ink placeholder:text-calilean-fog/60 outline-none focus:border-calilean-pacific/30 transition-colors"
      />
      <label className="flex items-start gap-2.5 text-left mt-2">
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
            className="text-calilean-pacific hover:text-calilean-pacific/80 transition-colors"
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
        className="w-full bg-calilean-pacific text-white rounded-btn py-3 text-sm font-medium hover:bg-calilean-pacific/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
      >
        Create account
      </button>
      <p className="text-calilean-fog text-xs mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-calilean-pacific hover:text-calilean-pacific/80 transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
