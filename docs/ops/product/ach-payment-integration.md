# ACH Payment Integration — CaliLean/Bluum

## Status: Sandbox Ready (module built, awaiting production merchant account)

## Context

Research peptides are classified high-risk. Stripe, PayPal, Square will not process.
All viable processors for this vertical route through **NMI** (Network Merchants) as the gateway.

## Processor Options

| Provider | Gateway | ACH/eCheck | Approval Speed | Requirements |
|----------|---------|------------|----------------|--------------|
| AllayPay | NMI | Yes | Same-day | 6+ months operating |
| PayBlox | NMI | Yes | 1-2 days | 1 year + LegitScript cert |
| Easy Pay Direct | NMI | Yes | 1-3 days | 6+ months operating |
| Corepay | NMI | Yes | Same-day | 6+ months, US-based |
| Paycron | NMI | Yes (eCheck focus) | Same-day | US-based, no FDA warnings |
| Vector Payments | NMI | Yes | 1-3 days | Compliance docs required |

## Implementation

### Files Created

```
apps/backend/src/modules/payment-nmi/
├── index.ts          # ModuleProvider(Modules.PAYMENT, { services: [NmiAchPaymentProviderService] })
├── service.ts        # Extends AbstractPaymentProvider — NMI transaction API
└── types.ts          # NMI request/response types, NmiOptions
```

### Environment Variables

**Backend** (`apps/backend/.env`):
```bash
NMI_API_KEY=<merchant-key>          # "api (Payment and Query APIs)" key from NMI
NMI_TOKENIZATION_KEY=<public-key>   # "tokenization (Collect.js)" key from NMI
NMI_SANDBOX=true                    # "true" = sandbox endpoint, unset/false = production
```

**Storefront** (`apps/storefront/.env.local`):
```bash
NEXT_PUBLIC_NMI_TOKENIZATION_KEY=<public-key>  # Same tokenization key, for Collect.js
```

**Railway**: Add same vars to Railway service environment.

### Provider Registration

Registered in `medusa-config.ts` alongside Stripe. Either or both can be active based on env vars:
- Stripe loads when `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` are set
- NMI loads when `NMI_API_KEY` is set

Provider ID in Medusa: `pp_nmi-ach_nmi-ach`

### Payment Flow

```
1. Customer selects "Pay with Bank Account" at checkout
2. initiatePayment() → returns tokenization key + session metadata
3. Storefront loads Collect.js, customer enters bank details
4. Collect.js tokenizes → returns payment_token
5. Cart completion → authorizePayment() sends ACH sale to NMI with token
6. NMI returns success → order created
7. ACH settles in 3-5 business days
```

### Method Mapping (actual implementation)

| Medusa Method | NMI Action | Notes |
|---------------|------------|-------|
| `initiatePayment()` | No NMI call | Returns tokenization key for storefront |
| `authorizePayment()` | `type=sale, payment=check` | ACH is sale-only (no auth-then-capture) |
| `capturePayment()` | No-op | Already captured at sale time |
| `refundPayment()` | `type=refund` | Requires `nmi_transaction_id` from data |
| `cancelPayment()` | `type=void` | Only works before settlement |
| `getPaymentStatus()` | Status from stored data | Returns authorized if txn ID exists |
| `getWebhookActionAndData()` | Processes NMI webhooks | Route: `/hooks/payment/nmi-ach_nmi-ach` |

### Storefront Collect.js Integration (TODO)

The storefront checkout needs a new payment option component that:
1. Loads `https://secure.nmi.com/token/Collect.js` with the tokenization key
2. Renders bank detail fields (name, routing, account, type)
3. On submit, tokenizes via Collect.js
4. Passes `payment_token` to the Medusa payment session

### Direct Bank Details (Testing Only)

For sandbox testing without Collect.js, use NMI's official test ACH credentials:
```json
{
  "checkname": "John Doe",
  "checkaba": "490000018",
  "checkaccount": "24413815",
  "account_type": "checking"
}
```

## NMI Sandbox

- **Sandbox endpoint**: `https://sandbox.nmi.com/api/transact.php`
- **Portal**: Login at `guide.nmi.com` to get sandbox API keys
- Test accounts are free — no transaction or monthly fees
- Process test transactions for all gateway functions (card + ACH)
- Never use real API keys when testing

### Test Mode

NMI allows toggling any gateway account into Test Mode. Transactions submitted in test mode are not live and do not charge real accounts.

## Go-Live Checklist

- [ ] Get high-risk merchant account (AllayPay, Corepay, etc.)
- [ ] Receive production NMI API key from merchant account provider
- [ ] Set `NMI_SANDBOX=false` (or remove) in Railway env
- [ ] Update `NMI_API_KEY` to production key in Railway env
- [ ] Enable NMI ACH provider in Medusa Admin (Settings > Regions > US)
- [ ] Build storefront Collect.js checkout component
- [ ] Configure NMI webhook to `https://backend.calilean.com/hooks/payment/nmi-ach_nmi-ach`
- [ ] Test end-to-end with real bank account
- [ ] Consider LegitScript certification for credibility

## Regulatory Notes

- Mastercard BRAM update (GLB 11691.1) in 2025 increased enforcement on "research only" peptides
- FDA has expanded regulatory categories for certain peptides
- ACH fees: ~0.8% capped at $5/tx (much cheaper than card processing)
- ACH settlement: 3-5 business days

## References

- [NMI Developer Docs](https://docs.nmi.com/)
- [NMI Transaction API](https://docs.nmi.com/reference/transactions-processing)
- [NMI Sandbox Testing](https://docs.nmi.com/docs/testing-sandbox)
- [NMI Collect.js](https://docs.nmi.com/docs/payment-component)
- [Medusa: Create Payment Module Provider](https://docs.medusajs.com/resources/references/payment/provider)
- [Medusa: Payment Provider Overview](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
- [Medusa: Webhook Events](https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events)
