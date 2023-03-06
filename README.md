# [HN Hiring Trends](https://www.hnhiringtrends.com)

## About
Every month, the [whoishiring](https://news.ycombinator.com/user?id=whoishiring) bot on HackerNews asks for people and companies to share if they're looking for jobs or hiring.
This site scrapes the comments from those posts and displays the number of top level comments per post.

You can hover over the data points to see the exact number of top level comments, or you can click on the datapoints to go to the original post.

You can filter the comments by keywords such as "remote", "senior", or "nyc".

Adding multiple filters lets you compare trends between keywords. For example, you can compare the number of "sf" and "nyc" job postings.

Your filters are synced with the url, so if you want to share a specific view, you can just copy the url!

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
# Local dev config
USE_CACHED_POSTS
WRITE_CACHED_POSTS
```