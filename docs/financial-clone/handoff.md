# Handoff

Updated: 2026-10-19T08:24:42.139Z

Local application built at /workspace/financial-calculators. 71 source entries, 70 functional calculator pages and one real-estate directory; 154 local calculation modes. 273 numeric/smoke/reference/regression checks passed. Browser report contains 71 routes and 154 modes. No deployment or external service registration.

Full one-to-one completion is not claimed. Read remaining-work.md before accepting the site or continuing. Source interaction/visual validation is blocked by the available source-reading capability. Local smoke success is not a source-parity guarantee. Preserve user edits and working modes; do not regenerate the project.

Run: npm run dev (Node.js24+). Production: npm run build then npm run start. See README.md for remote-localhost limitations. Browser QA server is stopped after validation.

Latest update: VAT now has one any-two form with four optional fields, supporting all six input pairs. Zero/indeterminate/inconsistent cases are explicit, Clear empties fields, and shared/legacy links preserve known values. Local mode count is now 154 because four VAT tabs were consolidated into one broader form, not because functionality was removed. 273 tests, TypeScript, production build, 71-route/154-mode full browser checks and 17 VAT-specific browser checks passed. See specs/vat.md and evidence/browser-vat-qa.json. Prior calculation audit and 401(k) user customization are preserved. Original exact VAT defaults/errors/visual parity remain unverified. Temporary QA server stopped after validation.

User explicitly confirmed uploading the VAT update to the public financial-calculators branch after the automatic-review block. Preserve the tested source and existing main branch.
