# Laptop Pull Instructions

> [!WARNING]
> **You should definitely back up your Postgres data** before pulling these changes on your laptop.

Here is what you need to know and do when you switch to your laptop:

## 1. Why you need a backup
In your most recent commit (`184cf426b` - "fix transactions"), you modified `backend/prisma/schema.prisma`. Specifically, you removed `ITEM_CREATED` and `ITEM_UPDATED` from the `AuditAction` enum. 

> [!CAUTION]
> Removing enum values is a **destructive operation** in Postgres. When you run the Prisma migration on your laptop, Prisma will warn you about potential data loss. If you have any existing rows in your database that use `ITEM_CREATED` or `ITEM_UPDATED`, those records may be deleted or the migration may fail. 

You should run a backup using `pg_dump` before applying any database changes just to be safe.

## 2. Steps to take on your laptop
Because the schema changed but no new migration files were committed in the repository, you'll need to generate them on your laptop:

1. **Backup Database:** Run your `pg_dump` command to secure your current data.
2. **Pull Changes:** Run `git pull` to fetch your latest commits.
3. **Migrate Database:** Run `npx prisma migrate dev` inside your `backend` folder to apply the schema changes and generate the migration file locally.
4. **Regenerate Prisma Client:** Run `npx prisma generate` to ensure your backend code knows about the new `CANCELLED` enum value and the removed audit actions.

## 3. Why your backend was crashing
Your backend was likely crashing because of unhandled promise rejections related to Prisma database transactions (which is exactly what your latest commits to the controllers and services appear to fix). Once you pull these changes, run the database migrations, and restart your backend, the crashes should be resolved!
