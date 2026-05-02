# mm-store

mariners market's is a prebaked ecommerce monorepo built with medusa 2.0 and next.js.
hosted on railway

### how it works
- **backend**: medusa 2.0 handles the core commerce logic (products, orders, customers).
- **storefront**: next.js app router for a fast, responsive shopping experience.
- **storage**: minio manages all product images and media.
- **search**: meilisearch provides instant product search.
- **email**: resend handles all transactional notifications.
- **payments**: stripe is integrated for secure credit card processing.
- **hosting**: pre-configured for one-click deployment on railway.

### local dev
- **backend**: `cd backend && pnpm dev` (runs on port 9000)
- **storefront**: `cd storefront && pnpm dev` (runs on port 8000)

### useful resources
- [medusa docs](https://docs.medusajs.com)
- [next.js docs](https://nextjs.org)
