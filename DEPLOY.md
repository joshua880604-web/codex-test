# Deploy a preview

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjoshua880604-web%2Fcodex-test%2Ftree%2Ffinancial-calculators)

The link imports the financial-calculators branch. Vercel may ask to create a repository for its copy; select your GitHub account and keep note of the resulting repository for future updates. This is an external deployment action requiring your browser login. No deployment has yet been created by this document.

- Framework: Next.js
- Root directory: repository root (.)
- Node.js: 24.x
- Install: npm ci
- Build: npm run build
- Output directory: framework default; do not set a static export directory
- Required environment variables: none

After deployment open /financial-calculator.html. The currency API uses public providers; a saved dated fallback is explicit. BTC conversion returns an error if its provider is unavailable.

For automatic updates from the original codex-test repository instead of a new copy, import that repository in Vercel and select financial-calculators as the deployment/production branch. The main branch currently contains only the original README and will not build this app.

The site is a review version. Full source visual/form parity is not verified; see docs/financial-clone/remaining-work.md. Vercel access protection depends on your account/project settings. No custom domain is required.
