# CaliLean SKU System (v1)

## Goals

- Drop the legacy `BLUUM-` prefix from all SKUs (brand changed).
- Compact, sortable, no slashes/spaces.
- Stable per product+dose so reorders/inventory match.
- Extensible to new compounds and new sizes without renumbering.
- Human-readable enough that fulfilment/customer ops can spot-check.

## Format

```
CL-{XXX}-{DDDD}
```

| Segment | Meaning                                           | Length | Example |
| ------- | ------------------------------------------------- | ------ | ------- |
| `CL`    | Brand prefix (CaliLean, fixed)                    | 2      | `CL`    |
| `XXX`   | Compound code (3 chars, A–Z + 0–9)                | 3      | `BPC`   |
| `DDDD`  | Per-vial dose in mg, zero-padded                  | 4      | `0010`  |

For blends (two compounds in one vial) the dose encodes the per-component
amount. The `XXX` code is unique per blend (e.g. `BTB` = BPC-157 + TB-500),
so the SKU itself is unambiguous even though the dose only shows one number.

Total length: 11 chars including dashes. Sortable by compound, then by
dose. Easy to extend to 5-digit doses if we ever sell anything > 9999mg
(we don't).

## Compound code map

| Handle                                | Title                           | Code  |
| ------------------------------------- | ------------------------------- | ----- |
| `bpc-157`                             | BPC-157                         | `BPC` |
| `th9507`                              | TH9507 (Tesamorelin)            | `TH9` |
| `ipamorelin`                          | Ipamorelin                      | `IPM` |
| `tb-500`                              | TB-500                          | `TB5` |
| `ghk-cu`                              | GHK-Cu                          | `GHK` |
| `pt-141`                              | PT-141                          | `PT1` |
| `glutathione`                         | Glutathione                     | `GLU` |
| `glow`                                | GLOW                            | `GLW` |
| `klow`                                | KLOW                            | `KLW` |
| `bpc-157-tb-500-blend`                | BPC-157 / TB-500 Blend          | `BTB` |
| `nad`                                 | NAD+                            | `NAD` |
| `snap-8`                              | Snap-8                          | `SN8` |
| `selank`                              | Selank                          | `SEL` |
| `cagrilintide`                        | Cagrilintide                    | `CAG` |
| `thymosin-alpha-1`                    | Thymosin Alpha-1                | `TA1` |
| `igf-1-lr3`                           | IGF-1 LR3                       | `IGF` |
| `hexarelin`                           | Hexarelin                       | `HEX` |
| `cjc-1295-no-dac`                     | CJC-1295 No DAC                 | `CJC` |
| `sermorelin`                          | Sermorelin                      | `SER` |
| `ghrp-2`                              | GHRP-2                          | `GH2` |
| `ghrp-6`                              | GHRP-6                          | `GH6` |
| `retatrutide`                         | Retatrutide                     | `RET` |
| `melanotan-i`                         | Melanotan I                     | `MT1` |
| `melanotan-ii`                        | Melanotan II                    | `MT2` |
| `mazdutide`                           | Mazdutide                       | `MAZ` |
| `semax`                               | Semax                           | `SMX` |
| `dsip`                                | DSIP                            | `DSP` |
| `epithalon`                           | Epithalon                       | `EPI` |
| `ahk-cu`                              | AHK-Cu                          | `AHK` |
| `mots-c`                              | MOTS-C                          | `MOT` |
| `pinealon`                            | Pinealon                        | `PIN` |
| `5-amino-1mq`                         | 5-Amino-1MQ                     | `5MQ` |
| `cjc-1295-no-dac-ipamorelin-blend`    | CJC-1295 No DAC / Ipamorelin    | `CJI` |

Codes are **append-only**. Once a code is assigned to a compound it is
never reused for anything else, even if the product is delisted.

## Examples

| Product                           | Variant   | New SKU       | Old SKU                                         |
| --------------------------------- | --------- | ------------- | ----------------------------------------------- |
| BPC-157                           | 5mg       | `CL-BPC-0005` | `BLUUM-BPC-157-5MG`                             |
| BPC-157                           | 10mg      | `CL-BPC-0010` | `BLUUM-BPC-157-10MG`                            |
| Glutathione                       | 1500mg    | `CL-GLU-1500` | `BLUUM-GLUTATHIONE-1500MG`                      |
| BPC-157 / TB-500 Blend            | 5mg/5mg   | `CL-BTB-0005` | `BLUUM-BPC-157-TB-500-BLEND-5MG-5MG`            |
| CJC-1295 No DAC / Ipamorelin Blend| 5mg/5mg   | `CL-CJI-0005` | `BLUUM-CJC-12-NO-DAC-IPAMORELIN-BLEND-5MG-5MG`  |

The full mapping for all 44 variants is in
[`docs/sku-mapping-v1.xlsx`](./sku-mapping-v1.xlsx) and the matching CSV
[`docs/sku-mapping-v1.csv`](./sku-mapping-v1.csv).

## Rules of the road

- Adding a new product → assign a new 3-char code, add a row to the table
  above, add it to `SKU_CODE_MAP` in `scripts/seed-products.py`, and to
  the `sku_code` field on the product in `storefront/src/data/products-seed.json`.
- Adding a new dose → no schema change needed; the seeder builds the SKU
  from `sku_code` + dose at insert time.
- Renaming a product → keep the same code. The code travels with the
  compound, not the marketing name.
- Discontinuing a product → leave the code reserved. Do not reuse.
