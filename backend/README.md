# mm-store backend

this is the medusa 2.0 core for mariner market.

### features
- **postgres**: primary database.
- **redis**: event bus and workflow caching.
- **minio**: cloud storage for media.
- **stripe**: payment processing.
- **resend**: email notifications.

### setup
1. `npm install`
2. `cp .env.template .env`
3. `npm run ib` (initialize database)
4. `npm run dev` (starts on port 9000)
