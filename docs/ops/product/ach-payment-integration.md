# ACH Payment Integration — CaliLean/Bluum

## Status: Planning (waiting on merchant account)

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

## NMI Sandbox (Free)

- **Sandbox URL**: `https://sandbox.nmi.com/api/transact.php`
- **Portal**: Login at `guide.nmi.com` to get sandbox API keys
- Test accounts are free — no transaction or monthly fees
- Can process test transactions for all gateway functions (card + ACH)
- Never use real API keys when testing — always use sandbox keys

### Test Mode

NMI allows toggling any gateway account into Test Mode. Transactions submitted in test mode are not live and do not charge real accounts.

## Architecture: Medusa Custom Payment Module Provider

```
backend/src/modules/payment-nmi/
├── index.ts          # ModuleProvider(Modules.PAYMENT, ...)
├── service.ts        # Extends AbstractPaymentProvider — NMI API calls
└── types.ts          # NMI request/response types
```

### NMI ACH API Basics

- REST POST to transaction endpoint
- Parameters: `type=sale`, `payment=check`, `checkname`, `checkaba` (routing), `checkaccount`, `account_type`
- Returns transaction ID + response code
- Supports: sale, auth, capture, void, refund for both card and eCheck

### Medusa ↔ NMI Method Mapping

| Medusa Method | NMI Action |
|---------------|------------|
| `initiatePayment()` | Create pending transaction record |
| `authorizePayment()` | `type=auth` or `type=sale` with `payment=check` |
| `capturePayment()` | `type=capture` (if auth-only) |
| `refundPayment()` | `type=refund` |
| `cancelPayment()` | `type=void` |
| `getPaymentStatus()` | Query transaction status |

### Storefront Checkout Form

No JS SDK needed. Collect via standard form:
- Account holder name
- Routing number (ABA)
- Account number
- Account type (checking/savings)

## Prerequisites Before Building

1. **High-risk merchant account** — Apply with a provider above
2. **NMI gateway credentials** — API security key from merchant account provider
3. **LegitScript certification** — Some processors require it
4. **6+ months in business** — Most require this minimum

## Regulatory Notes

- Mastercard BRAM update (GLB 11691.1) in 2025 increased enforcement on "research only" peptides
- FDA has expanded regulatory categories for certain peptides
- ACH fees: ~0.8% capped at $5/tx (much cheaper than card processing)
- ACH settlement: 3-5 business days

## References

- [NMI Developer Docs](https://docs.nmi.com/)
- [NMI Transaction API](https://docs.nmi.com/reference/transactions-processing)
- [NMI Sandbox Testing](https://docs.nmi.com/docs/testing-sandbox)
- [Medusa: Create Payment Module Provider](https://docs.medusajs.com/resources/references/payment/provider)
- [Medusa: Payment Provider Overview](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
