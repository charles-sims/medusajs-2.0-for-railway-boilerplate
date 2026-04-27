import {
  applyBatchPatch,
  buildCoaObjectKey,
  buildCoaPublicUrl,
  CoaPanel,
  deepMerge,
  deleteBatch,
  filenameForKind,
  isCoaFileKind,
  migrateCoaPanel,
  resolveCoaSku,
} from "../helpers"

const FROZEN_NOW = () => new Date("2026-04-27T05:30:00.000Z")

describe("migrateCoaPanel", () => {
  it("converts the legacy 'standard' string form to a structured panel", () => {
    expect(migrateCoaPanel("standard")).toEqual({
      tier: "standard",
      current_batch_id: null,
      batches: {},
    })
  })

  it("converts the legacy 'extended' string form to a structured panel", () => {
    expect(migrateCoaPanel("extended")).toEqual({
      tier: "extended",
      current_batch_id: null,
      batches: {},
    })
  })

  it("preserves an already-structured panel", () => {
    const input: CoaPanel = {
      tier: "extended",
      current_batch_id: "B1",
      batches: { B1: { hplc_purity_pct: "99.8" } },
    }
    expect(migrateCoaPanel(input)).toEqual(input)
  })

  it("falls back to a sane default when input is null/undefined", () => {
    expect(migrateCoaPanel(undefined)).toEqual({
      tier: "standard",
      current_batch_id: null,
      batches: {},
    })
    expect(migrateCoaPanel(null)).toEqual({
      tier: "standard",
      current_batch_id: null,
      batches: {},
    })
  })
})

describe("deepMerge", () => {
  it("merges plain objects recursively", () => {
    const base = { a: 1, nested: { x: 1, y: 2 } }
    const incoming = { nested: { y: 99, z: 3 } }
    expect(deepMerge(base, incoming as any)).toEqual({
      a: 1,
      nested: { x: 1, y: 99, z: 3 },
    })
  })

  it("replaces primitives and arrays rather than merging them", () => {
    const base = { a: 1, list: [1, 2, 3] }
    const incoming = { a: 2, list: [4] }
    expect(deepMerge(base, incoming as any)).toEqual({ a: 2, list: [4] })
  })

  it("ignores undefined values in the incoming object", () => {
    const base = { a: 1, b: 2 }
    const incoming = { a: undefined, b: 99 }
    expect(deepMerge(base, incoming as any)).toEqual({ a: 1, b: 99 })
  })
})

describe("applyBatchPatch", () => {
  it("creates a new batch and sets it as current by default", () => {
    const next = applyBatchPatch(
      "standard",
      {
        batch_id: "B1",
        hplc_purity_pct: "99.82",
        lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
      },
      FROZEN_NOW
    )
    expect(next.current_batch_id).toBe("B1")
    expect(next.batches.B1).toEqual({
      hplc_purity_pct: "99.82",
      lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
      issued_at: "2026-04-27T05:30:00.000Z",
    })
    expect(next.tier).toBe("standard")
  })

  it("merges into an existing batch and keeps prior values", () => {
    const before: CoaPanel = {
      tier: "extended",
      current_batch_id: "B1",
      batches: {
        B1: {
          hplc_purity_pct: "99.82",
          lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
          files: { standard_coa_pdf: "https://x/standard.pdf" },
        },
      },
    }
    const next = applyBatchPatch(
      before,
      {
        batch_id: "B1",
        endotoxin_eu_per_mg: "<0.5",
        files: { chromatogram: "https://x/chromatogram.pdf" },
      },
      FROZEN_NOW
    )
    expect(next.batches.B1).toEqual({
      hplc_purity_pct: "99.82",
      lcms_identity: { confirmed: true, method_ref: "USP <1736>" },
      endotoxin_eu_per_mg: "<0.5",
      files: {
        standard_coa_pdf: "https://x/standard.pdf",
        chromatogram: "https://x/chromatogram.pdf",
      },
      issued_at: "2026-04-27T05:30:00.000Z",
    })
  })

  it("does not change current_batch_id when patching an existing batch with set_current omitted", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B1",
      batches: { B1: { hplc_purity_pct: "99.0" }, B2: { hplc_purity_pct: "98.0" } },
    }
    const next = applyBatchPatch(before, {
      batch_id: "B2",
      endotoxin_eu_per_mg: "<0.5",
    })
    expect(next.current_batch_id).toBe("B1")
    expect(next.batches.B2.endotoxin_eu_per_mg).toBe("<0.5")
  })

  it("respects set_current=true on an existing batch", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B1",
      batches: { B1: {}, B2: {} },
    }
    const next = applyBatchPatch(before, { batch_id: "B2", set_current: true })
    expect(next.current_batch_id).toBe("B2")
  })

  it("respects set_current=false even on a brand-new batch", () => {
    const next = applyBatchPatch(undefined, {
      batch_id: "B-new",
      hplc_purity_pct: "99.0",
      set_current: false,
    })
    expect(next.current_batch_id).toBeNull()
    expect(next.batches["B-new"].hplc_purity_pct).toBe("99.0")
  })

  it("throws when batch_id is missing", () => {
    expect(() => applyBatchPatch(undefined, {} as any)).toThrow(/batch_id/)
  })

  it("stamps issued_at as ISO-8601 server time on every patch", () => {
    const next = applyBatchPatch(
      undefined,
      { batch_id: "B1", hplc_purity_pct: "99.0" },
      FROZEN_NOW
    )
    expect(next.batches.B1.issued_at).toBe("2026-04-27T05:30:00.000Z")
  })

  it("refreshes issued_at when patching an existing batch", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B1",
      batches: {
        B1: { hplc_purity_pct: "99.0", issued_at: "2026-04-01T00:00:00.000Z" },
      },
    }
    const next = applyBatchPatch(
      before,
      { batch_id: "B1", endotoxin_eu_per_mg: "<0.5" },
      FROZEN_NOW
    )
    expect(next.batches.B1.issued_at).toBe("2026-04-27T05:30:00.000Z")
  })
})

describe("deleteBatch", () => {
  it("case 1: deleting current batch with siblings promotes most recent sibling", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B-CURRENT",
      batches: {
        "B-CURRENT": { issued_at: "2026-04-27T00:00:00.000Z" },
        "B-OLDER": { issued_at: "2026-03-01T00:00:00.000Z" },
        "B-NEWEST-SIBLING": { issued_at: "2026-04-20T00:00:00.000Z" },
      },
    }
    const next = deleteBatch(before, "B-CURRENT")
    expect(next.batches["B-CURRENT"]).toBeUndefined()
    expect(next.current_batch_id).toBe("B-NEWEST-SIBLING")
    expect(Object.keys(next.batches).sort()).toEqual([
      "B-NEWEST-SIBLING",
      "B-OLDER",
    ])
  })

  it("case 2: deleting current batch with no siblings nulls current_batch_id", () => {
    const before: CoaPanel = {
      tier: "extended",
      current_batch_id: "B-ONLY",
      batches: { "B-ONLY": { issued_at: "2026-04-27T00:00:00.000Z" } },
    }
    const next = deleteBatch(before, "B-ONLY")
    expect(next.current_batch_id).toBeNull()
    expect(next.batches).toEqual({})
  })

  it("case 3: deleting non-current batch leaves current_batch_id unchanged", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B-CURRENT",
      batches: {
        "B-CURRENT": { issued_at: "2026-04-27T00:00:00.000Z" },
        "B-OTHER": { issued_at: "2026-04-01T00:00:00.000Z" },
      },
    }
    const next = deleteBatch(before, "B-OTHER")
    expect(next.current_batch_id).toBe("B-CURRENT")
    expect(next.batches["B-OTHER"]).toBeUndefined()
    expect(next.batches["B-CURRENT"]).toBeDefined()
  })

  it("case 4: deleting non-existent batch returns the panel unchanged (idempotent)", () => {
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B-ONLY",
      batches: { "B-ONLY": { issued_at: "2026-04-27T00:00:00.000Z" } },
    }
    const next = deleteBatch(before, "B-MISSING")
    expect(next).toEqual(before)
  })

  it("breaks issued_at ties on sibling promotion via batch_id desc", () => {
    const sameTimestamp = "2026-04-15T00:00:00.000Z"
    const before: CoaPanel = {
      tier: "standard",
      current_batch_id: "B-CURRENT",
      batches: {
        "B-CURRENT": { issued_at: "2026-04-27T00:00:00.000Z" },
        "B-AAA": { issued_at: sameTimestamp },
        "B-ZZZ": { issued_at: sameTimestamp },
      },
    }
    const next = deleteBatch(before, "B-CURRENT")
    expect(next.current_batch_id).toBe("B-ZZZ")
  })

  it("migrates legacy string panel before delete (no-op on empty batches)", () => {
    const next = deleteBatch("standard", "B1")
    expect(next).toEqual({
      tier: "standard",
      current_batch_id: null,
      batches: {},
    })
  })

  it("throws when batch_id is missing", () => {
    expect(() => deleteBatch({}, "")).toThrow(/batch_id/)
  })
})

describe("misc helpers", () => {
  it("isCoaFileKind validates the allowed kinds", () => {
    expect(isCoaFileKind("standard_coa")).toBe(true)
    expect(isCoaFileKind("extended_coa")).toBe(true)
    expect(isCoaFileKind("chromatogram")).toBe(true)
    expect(isCoaFileKind("nope")).toBe(false)
    expect(isCoaFileKind(undefined)).toBe(false)
  })

  it("filenameForKind maps kind → filename", () => {
    expect(filenameForKind("standard_coa")).toBe("standard-coa.pdf")
    expect(filenameForKind("extended_coa")).toBe("extended-coa.pdf")
    expect(filenameForKind("chromatogram")).toBe("chromatogram.pdf")
  })

  it("buildCoaObjectKey produces the expected layout", () => {
    expect(buildCoaObjectKey("ret-5mg", "B1", "standard-coa.pdf")).toBe(
      "coa/ret-5mg/B1/standard-coa.pdf"
    )
  })

  it("buildCoaPublicUrl strips trailing slash on base", () => {
    expect(buildCoaPublicUrl("https://s3.calilean.bio/", "coa/x/y.pdf")).toBe(
      "https://s3.calilean.bio/coa/x/y.pdf"
    )
    expect(buildCoaPublicUrl("https://s3.calilean.bio", "coa/x/y.pdf")).toBe(
      "https://s3.calilean.bio/coa/x/y.pdf"
    )
  })

  it("resolveCoaSku prefers metadata.sku, falls back to handle", () => {
    expect(resolveCoaSku({ handle: "ret-5", metadata: { sku: "RET-5MG" } })).toBe(
      "RET-5MG"
    )
    expect(resolveCoaSku({ handle: "ret-5", metadata: null })).toBe("ret-5")
    expect(() => resolveCoaSku({ handle: "", metadata: null })).toThrow()
  })
})
