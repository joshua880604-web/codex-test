# Everyday tools — October 20, 2026

Added four user-requested tools outside the original 71-entry financial scope. Original financial routes and modes remain available. The directory contains a separate Everyday Tools category, with a top-navigation anchor and sidebar entrances. All pages are static-rendered with actual calculator forms, guides, FAQ, examples, related tools and utility-application metadata; previews remain noindex. No daily-tool search-volume research or traffic projection is claimed.

| Tool | Route | Modes |
| --- | --- | --- |
| Percentage | /percentage-calculator.html | Percent of a number; percentage change; part as a percentage |
| Tip and Bill Split | /tip-bill-split-calculator.html | Bill, optional tax/tip, people and display currency |
| Date | /date-calculator.html | Calendar date difference; add/subtract signed days |
| Unit Converter | /unit-converter.html | Length, mass, temperature, area, volume, speed |

## Global assumptions

The interface is English. Tip percentage is optional and does not infer national customs. Currency selection changes formatting/rounding, not exchange rates. Inputs default to USD but EUR, GBP, JPY, CNY, CAD, AUD and INR are selectable. Bills and tax are rounded half-up to currency minor units with decimal exponent shifting; tip is rounded on the entered bill base. Integer minor units are divided and remainder units assigned one at a time, so shares sum to the rounded total. Zero-decimal JPY is supported. Maximum group size is 1,000; unsafe monetary integer precision is rejected.

Dates use proleptic Gregorian calendar dates in years 0001–9999. They do not calculate local elapsed hours, business days or holidays. Inclusive counting adds one to magnitude (one for the same date), and reversed date ranges are negative. Date addition accepts only whole days and displays the resulting ISO date prominently.

Unit definitions explicitly distinguish US liquid gallons/fluid ounces from Imperial ones. Temperature has scale factors and offsets and rejects below-absolute-zero inputs (with a small numerical tolerance). Units from different dimensional categories cannot be mixed. Internal conversions use floating-point numbers; displayed precision is bounded. Percentage change from a negative baseline uses the absolute original value; zero denominators are rejected.

## Evidence and scope

The full directory now has 75 entries: 70 financial calculators, one real-estate directory, and four everyday tools. There are 74 working calculators, 170 modes, 79 public sitemap pages when indexable, and 94 worked examples. Added twelve modes and seven examples are genuine calculations. This does not change the unverified original-site form/visual parity status of the financial clone.

407 tests passed; TypeScript and production build passed. Initial-HTML SEO verification covers all 79 pages. Evidence reports are under evidence/: browser-everyday-qa.json, browser-ui-qa.json, browser-qa.json and browser-seo-qa.json. No new dependency, external service or hosted deployment was introduced. Screenshots are local-only review artifacts.

Browser results: 19 dedicated everyday checks, 20 shared UI checks, 75 routes / 170 modes in the full regression, and all 94 examples in 102 SEO checks passed.
