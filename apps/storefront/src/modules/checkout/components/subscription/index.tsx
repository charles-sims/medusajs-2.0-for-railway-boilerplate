"use client"

import { Button, clx, Heading, Text, RadioGroup, Badge } from "@medusajs/ui"
import { CheckCircleSolid, RocketLaunch, Clock, Calendar, CheckMini } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { updateSubscriptionData, removeSubscriptionData } from "@lib/data/cart"
import ErrorMessage from "@modules/checkout/components/error-message"

const SubscriptionForm = ({ cart }: { cart: any }) => {
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">(
    cart?.metadata?.subscription_interval ? "subscription" : "one-time"
  )
  const [interval, setInterval] = useState<string>(
    (cart?.metadata?.subscription_interval as string) || "monthly"
  )
  const [period, setPeriod] = useState(
    Number(cart?.metadata?.subscription_period) || 3
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "subscription"
  const hasData = cart?.metadata?.subscription_interval && cart?.metadata?.subscription_period
  const addressReady = !!cart?.shipping_address?.address_1 && !!cart?.email

  // Sync state if cart changes
  useEffect(() => {
    if (cart?.metadata?.subscription_interval) {
      setPurchaseType("subscription")
      setInterval(cart.metadata.subscription_interval)
      setPeriod(Number(cart.metadata.subscription_period))
    } else {
      setPurchaseType("one-time")
    }
  }, [cart])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "subscription"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (purchaseType === "subscription") {
        await updateSubscriptionData(interval, period)
      } else {
        await removeSubscriptionData()
      }
      router.push(pathname + "?step=delivery", { scroll: false })
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-calilean-sand rounded-large p-6 sm:p-8">
      <div className="flex flex-row items-center justify-between mb-8">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-center text-calilean-ink",
            {
              "opacity-50 pointer-events-none select-none": !isOpen && !addressReady,
            }
          )}
        >
          Purchase Options
          {!isOpen && hasData && <CheckCircleSolid className="text-calilean-pacific" />}
        </Heading>
        {!isOpen && addressReady && (
          <button
            onClick={handleEdit}
            className="text-calilean-pacific hover:text-calilean-ink transition-colors text-small-semi uppercase tracking-widest"
          >
            Edit
          </button>
        )}
      </div>

      <div className={isOpen ? "block" : "hidden"}>
        <div className="grid grid-cols-1 gap-y-6">
          <div className="flex flex-col gap-y-4">
            <RadioGroup
              value={purchaseType}
              onValueChange={(v: any) => setPurchaseType(v)}
              className="flex flex-col gap-y-4"
            >
              {/* Subscription Option */}
              <div 
                className={clx(
                  "relative flex flex-col p-5 border rounded-btn cursor-pointer transition-all",
                  purchaseType === "subscription" 
                    ? "border-calilean-ink bg-calilean-sand/10 ring-1 ring-calilean-ink" 
                    : "border-calilean-sand hover:border-calilean-fog bg-white"
                )}
                onClick={() => setPurchaseType("subscription")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-x-3">
                    <RadioGroup.Item value="subscription" id="subscription" />
                    <Text className="text-base-semi text-calilean-ink">Subscribe & Save</Text>
                    <Badge color="green" size="small" className="bg-green-100 text-green-700 border-green-200">Best Value</Badge>
                  </div>
                  <Text className="text-small-semi text-calilean-pacific uppercase tracking-tighter">Save 15%</Text>
                </div>
                
                <Text className="text-small-regular text-ui-fg-subtle mb-4 pl-8">
                  Guaranteed batch consistency and priority fulfillment for your ongoing research.
                </Text>

                {purchaseType === "subscription" && (
                  <div className="mt-4 pl-8 border-t border-calilean-sand pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="text-xsmall-regular uppercase tracking-widest text-ui-fg-subtle mb-2 block">
                          Delivery Frequency
                        </label>
                        <NativeSelect
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                          className="bg-white"
                        >
                          <option value="monthly">Every Month</option>
                          <option value="yearly">Every Year</option>
                        </NativeSelect>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Input
                          label="Total Duration"
                          name="period"
                          value={period}
                          onChange={(e) => setPeriod(parseInt(e.target.value) || 1)}
                          type="number"
                          min="1"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-calilean-ink/5 rounded-soft flex items-start gap-x-2">
                      <Clock className="text-calilean-pacific mt-0.5" />
                      <Text className="text-small-regular text-calilean-ink italic">
                        Renews automatically {interval === "monthly" ? "monthly" : "yearly"} for {period} {interval === "monthly" ? "months" : "years"}. Cancel anytime.
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* One-time Option */}
              <div 
                className={clx(
                  "relative flex flex-col p-5 border rounded-btn cursor-pointer transition-all",
                  purchaseType === "one-time" 
                    ? "border-calilean-ink bg-calilean-sand/10 ring-1 ring-calilean-ink" 
                    : "border-calilean-sand hover:border-calilean-fog bg-white"
                )}
                onClick={() => setPurchaseType("one-time")}
              >
                <div className="flex items-center gap-x-3">
                  <RadioGroup.Item value="one-time" id="one-time" />
                  <Text className="text-base-semi text-calilean-ink">One-time purchase</Text>
                </div>
                <Text className="text-small-regular text-ui-fg-subtle mt-2 pl-8">
                  Standard purchase with no recurring commitment.
                </Text>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-y-6 mt-4">
            <div className="flex flex-col gap-y-3 px-2">
              <div className="flex items-center gap-x-2 text-calilean-pacific">
                <CheckMini />
                <Text className="text-small-regular">Free Priority Shipping on subscriptions</Text>
              </div>
              <div className="flex items-center gap-x-2 text-calilean-pacific">
                <CheckMini />
                <Text className="text-small-regular">Batch-locked Certificates of Analysis</Text>
              </div>
            </div>

            <ErrorMessage error={error} />

            <Button
              size="large"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="bg-calilean-ink hover:bg-calilean-ink/90 text-white w-full sm:w-fit min-w-[200px]"
            >
              Continue to delivery
            </Button>
          </div>
        </div>
      </div>

      {!isOpen && (
        <div className={clx("transition-all duration-300", hasData || purchaseType === "one-time" ? "opacity-100" : "opacity-0")}>
          <div className="bg-calilean-sand/20 p-4 rounded-btn border border-calilean-sand border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Text className="text-xsmall-regular uppercase tracking-widest text-ui-fg-subtle mb-1">
                  Selected Plan
                </Text>
                <Text className="text-base-semi text-calilean-ink">
                  {cart?.metadata?.subscription_interval 
                    ? `Subscription (${cart.metadata.subscription_interval === "monthly" ? "Monthly" : "Yearly"})` 
                    : "One-time Purchase"}
                </Text>
              </div>
              {cart?.metadata?.subscription_interval && (
                <div className="flex flex-col text-right">
                  <Text className="text-xsmall-regular uppercase tracking-widest text-ui-fg-subtle mb-1">
                    Duration
                  </Text>
                  <Text className="text-base-semi text-calilean-ink">
                    {cart.metadata.subscription_period} {cart.metadata.subscription_interval === "monthly" ? "Months" : "Years"}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionForm
