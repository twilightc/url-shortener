# URL-Shortener

### [Demo](https://test-url-shortener.vercel.app/ "shorturl demo")
A simple URL shortener built with Next.js 14.
![alt text](image-1.png)

After the short URL has been created, when trying to paste it into application like Teams, the link will provide
OpenGraph information.
![alt text](image-2.png)

## Features
* Nextjs 14 (App Router)
* Vercel
* Prisma
* PostgreSQL
* Redis (aka kv in Project)

Here we use vercel serverless function, which means
you don't need to build database locally.


## Getting started

After clone to your repository, run:
```bash
npm install
```

Then check [prisma doc](https://github.com/prisma/prisma "prisma document") and [next doc](https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app/deploy "deploy to vercel")
to learn how to manipulate and manage your db on vercel.

During development, use
```bash
npx prisma client
```
this can help you modify your data in vercel without using SQL in simple cases.

## Notice

1. Remove bash command may cause tsc compilation
to some issues, see: [Lint-staged ignore tsconfig.json when executing tsc](https://tychang9527.notion.site/Lint-staged-ignore-tsconfig-json-when-executing-tsc-0959c238053643ee8c08d17810f0dfc9?pvs=74 "lint-staged setting")

    ![alt text](image.png)

2. If you can run program on local normally, but usually get status code `504` or `500` on production(i.e. vercel), this may because your http(s) request has reached max duration, see: [max-duration](https://vercel.com/docs/functions/runtimes#max-duration "max duration")

3. Since the project will retrieve og info from original site, it may leads status code `500` if you try to shorten URLs that need authorization or forbid program to get OpenGraph metadata.

   In this condition, you may abort `open-graph-scraper` and extract og info from original URL by yourself, since `open-graph-scraper` have wrapped response, it may difficult to extract http status code we want.

   Finally, use library like [p-retry](https://github.com/sindresorhus/p-retry 'p-retry') to handle refetch part,
   and produce shoertened URL without og info as an alternative.