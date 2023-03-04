# [HN Hiring Trends](https://www.hnhiringtrends.com)

## About
This is a interactive visualization of all the top level comments from the
[whoishiring](https://news.ycombinator.com/user?id=whoishiring) threads. 

## Architecture
The frontend is a static next.js site that is deployed to Vercel.
The backend is a cron job that periodically queries the HackerNews Algolia API,
parses it and then uploads the result to Cloudflare R2.

## Run it Locally
```bash
pnpm i
pnpm dev
```

## Required Environment Variables
```bash
# Cloudflare keys
CF_ACCESS_KEY_ID
CF_ACCOUNT_ID
CF_BUCKET
CF_SECRET_ACCESS_KEY
NEXT_PUBLIC_CF_DATA_SUBDOMAIN
# Cron Bearer Auth Token
CRON_TRIGGER_TOKEN
# Local dev config
USE_CACHED_POSTS
WRITE_CACHED_POSTS
```