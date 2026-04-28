import type { CoaPanelMeta, ResolvedCoaPanel } from "./resolve"

export type CoaPanelFixture = {
  name: string
  input: CoaPanelMeta | undefined
  expected: ResolvedCoaPanel
}

export const COA_PANEL_FIXTURES: CoaPanelFixture[] = [
  {
    name: "legacy string — standard",
    input: "standard",
    expected: {
      tier: "standard",
      effectiveTier: "standard",
      batchId: null,
      batch: null,
      pending: true,
      extendedDeferred: false,
    },
  },
  {
    name: "structured-but-empty",
    input: { tier: "standard", current_batch_id: null, batches: {} },
    expected: {
      tier: "standard",
      effectiveTier: "standard",
      batchId: null,
      batch: null,
      pending: true,
      extendedDeferred: false,
    },
  },
  {
    name: "structured standard with files",
    input: {
      tier: "standard",
      current_batch_id: "B-2026-04",
      batches: {
        "B-2026-04": {
          hplc_purity_pct: "99.82",
          files: {
            standard_coa_pdf:
              "https://s3.calilean.com/coa/sema/B-2026-04/standard-coa.pdf",
          },
          issued_at: "2026-04-15",
        },
      },
    },
    expected: {
      tier: "standard",
      effectiveTier: "standard",
      batchId: "B-2026-04",
      batch: {
        hplc_purity_pct: "99.82",
        files: {
          standard_coa_pdf:
            "https://s3.calilean.com/coa/sema/B-2026-04/standard-coa.pdf",
        },
        issued_at: "2026-04-15",
      },
      pending: false,
      extendedDeferred: false,
    },
  },
  {
    name: "structured extended with all fields",
    input: {
      tier: "extended",
      current_batch_id: "B-2026-04",
      batches: {
        "B-2026-04": {
          hplc_purity_pct: "99.91",
          lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
          endotoxin_eu_per_mg: "<0.5",
          ref_standard_match_pct: "99.4",
          files: {
            standard_coa_pdf:
              "https://s3.calilean.com/coa/reta/B-2026-04/standard-coa.pdf",
            extended_coa_pdf:
              "https://s3.calilean.com/coa/reta/B-2026-04/extended-coa.pdf",
            chromatogram:
              "https://s3.calilean.com/coa/reta/B-2026-04/chromatogram.pdf",
          },
          issued_at: "2026-04-20",
        },
      },
    },
    expected: {
      tier: "extended",
      effectiveTier: "extended",
      batchId: "B-2026-04",
      batch: {
        hplc_purity_pct: "99.91",
        lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
        endotoxin_eu_per_mg: "<0.5",
        ref_standard_match_pct: "99.4",
        files: {
          standard_coa_pdf:
            "https://s3.calilean.com/coa/reta/B-2026-04/standard-coa.pdf",
          extended_coa_pdf:
            "https://s3.calilean.com/coa/reta/B-2026-04/extended-coa.pdf",
          chromatogram:
            "https://s3.calilean.com/coa/reta/B-2026-04/chromatogram.pdf",
        },
        issued_at: "2026-04-20",
      },
      pending: false,
      extendedDeferred: false,
    },
  },
  {
    name: "extended tier requested but extended panel pending",
    input: {
      tier: "extended",
      current_batch_id: "B-2026-04",
      batches: {
        "B-2026-04": {
          hplc_purity_pct: "99.5",
          files: {
            standard_coa_pdf:
              "https://s3.calilean.com/coa/reta/B-2026-04/standard-coa.pdf",
          },
        },
      },
    },
    expected: {
      tier: "extended",
      effectiveTier: "standard",
      batchId: "B-2026-04",
      batch: {
        hplc_purity_pct: "99.5",
        files: {
          standard_coa_pdf:
            "https://s3.calilean.com/coa/reta/B-2026-04/standard-coa.pdf",
        },
      },
      pending: false,
      extendedDeferred: true,
    },
  },
  {
    name: "single-entry batches without explicit current_batch_id",
    input: {
      tier: "standard",
      current_batch_id: null,
      batches: {
        "B-ONLY": {
          hplc_purity_pct: "98.7",
        },
      },
    },
    expected: {
      tier: "standard",
      effectiveTier: "standard",
      batchId: "B-ONLY",
      batch: { hplc_purity_pct: "98.7" },
      pending: false,
      extendedDeferred: false,
    },
  },
]
