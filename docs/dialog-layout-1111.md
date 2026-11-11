# Drift write-dialog layout repair

Base: 7d7ab92892596a9305a4b1ec3e7f941c63a3a5eb (merged main).
Branch: codex/dialog-overflow-1111.

DRIFT-DIALOG-1111: long labels and paths expand the approval dialog's grid
children beyond its boundary, hiding Cancel and Write. Reproduced in installed
0.3.0 while sending three OAuth configuration secrets. The upload itself succeeded; GitHub
metadata changed only those three entries. No repeat upload is needed.

Plan: change only the renderer ApplyDialog layout: constrained flex column,
wrapping header, scrollable body, stationary footer. Two independent plan
reviewers approved this approach; both require wrapping long safety/error text
and proving last-key access at the minimum supported 900x600 size.

Ownership/preservation:

| Capability                                 | Owner/interface              | Preservation check                          |
| ------------------------------------------ | ---------------------------- | ------------------------------------------- |
| Candidate selection and explicit approval  | ApplyDialog / applyPlan      | existing sync E2E                           |
| Secret encryption, write, readback, fences | main provider/store adapters | untouched source; full tests                |
| Source/target identity                     | existing labelFor/FileLabel  | real long-path dialog geometry              |
| Buttons and full key-list access           | renderer layout              | viewport/dialog bounds and final-key scroll |
| App settings and credentials               | existing user-data/keyring   | local installation preserves user-data      |

Declared files before implementation: P: ApplyDialog.tsx; T:
e2e/dialog-layout.spec.ts; R: this record. No dependency/configuration change.
Target production diff below 800 lines. Raw final base/head sizes and validation
receipts will be appended here. No new lifecycle/status/business decision.

## Validation and review

Untouched main failed the new real Electron bounds assertion: Cancel had viewport
ratio zero. Fixed Electron layout, selected-key sync, stale-plan refusal and
cancel/no-write scenarios pass (4 tests). The strengthened layout fixture uses a
valid macOS path below 1024 bytes, 180 additional synthetic keys, and both
1100x800 and 900x600 viewports. It checks header identity, last-key access and both
buttons inside the dialog and viewport. Both independent reviewers approve the
final source; reviewer A independently reran the layout test successfully.

Final npm check passes typechecking, lint, formatting and all 241 unit tests.
No existing regression assertions were changed. The local install replaces only
renderer files, preserving all 12,589 non-renderer archive files byte-for-byte.
ASAR integrity metadata and local ad-hoc signature are regenerated. Original
archive is retained for rollback. User-data and keyring files are untouched.

Personal fork: sadmoondog/drift; upstream: PiperGuy/drift. Incoming main versus
0.3.0 contains the already-accepted StatusBar version label/test (11 P / 31 T),
preserved as the merged baseline rather than copied into this change.
