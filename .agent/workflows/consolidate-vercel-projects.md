---
description: Consolidate Vercel projects to health-tracker
---

# Consolidate Vercel Projects to health-tracker

## Current Status
✅ Local project is now linked to `health-tracker`

## Next Steps

### 1. Connect Database to health-tracker Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your **health-tracker** project
3. Click on the **Storage** tab
4. Click **Connect Store** or **Connect Database**
5. Select **Postgres**
6. You should see your existing Postgres database in the list
7. Select it and click **Connect**
8. This will automatically add `DATABASE_URL` and `DIRECT_URL` to your project's environment variables

### 2. Pull Updated Environment Variables

After connecting the database in the Vercel dashboard, run:

```bash
npx vercel env pull .env.local
```

This will download the updated environment variables including the database URLs.

### 3. Verify Database Connection

Test that the database connection works:

```bash
npm run dev
```

Visit the app and verify that data is loading correctly.

### 4. Deploy to health-tracker

Deploy the app to ensure everything works in production:

```bash
npx vercel --prod
```

### 5. Delete health-journal Project

Once you've verified everything works:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **health-journal** project
3. Go to **Settings** → **General**
4. Scroll to the bottom and click **Delete Project**
5. Confirm deletion

## Notes

- The database itself doesn't need to be "moved" - it can be connected to multiple projects
- Once you delete the `health-journal` project, the database will only be connected to `health-tracker`
- All your data will be preserved throughout this process
