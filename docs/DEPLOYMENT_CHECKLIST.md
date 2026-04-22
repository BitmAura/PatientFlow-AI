# Deployment Checklist (Vercel + Next.js)

Use this checklist before promoting changes to production.

## Required Project Settings

- Framework Preset: `Next.js`
- Root Directory: repository root (`.`)
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave empty (do not set `.next` or `dist`)

## Domain and Routing

- Ensure the latest production deployment is `READY`.
- Confirm both aliases are attached to the same deployment:
  - `patientflow.ai`
  - `www.patientflow.ai`
- If apex should redirect to `www`, verify redirect target is already valid.

## DNS Records

- Apex record:
  - `A @ -> 216.198.79.1`
- `www` record:
  - `CNAME www -> <value provided by Vercel Domains UI>`
- Remove conflicting duplicate records for `@` or `www`.

## Pre-Deploy Validation

- Run:
  - `npm run build`
- Check build output includes:
  - `Route (app)` table
  - `○ /` for homepage route
- If build fails with `page_client-reference-manifest` ENOENT:
  - Verify framework is `Next.js`
  - Verify output directory is empty
  - Redeploy from latest `main` commit

## Post-Deploy Smoke Test

- Open:
  - `/`
  - `/pricing`
  - `/book-demo`
  - `/portal/login`
- Confirm no Vercel `NOT_FOUND` for attached domains.
- Verify key API health:
  - `/api/stats/dashboard`

## Rollback Rule

- If production smoke checks fail, rollback to the last `READY` deployment immediately.
