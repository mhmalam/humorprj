## The Humor Project Admin

This project is a **superadmin-only** Next.js admin console for a Supabase database.

### What you can do

- **Read** users/profiles (`profiles`)
- **Create / Read / Update / Delete** images (`images`)
- **Read** captions (`captions`)
- View a small **stats dashboard** at `/admin`

### Security model (important)

- All `/admin/*` routes require **Google login**.
- After login, access is granted **only if** `profiles.is_superadmin = true`.
- Admin data access is done server-side via Supabase **service role** (this does **not** change any RLS policies).

## Getting Started

### Environment variables

You need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose as `NEXT_PUBLIC_*`)

### Run locally

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` and you’ll be redirected to `/admin`.

### Avoid locking yourself out (bootstrapping superadmin)

If the admin requires `profiles.is_superadmin = true`, you “bootstrap” the first superadmin using privileged access you already have:

- **Option A (recommended)**: In the Supabase dashboard, after you sign in once (so a `profiles` row exists), run a SQL update in the SQL editor:

```sql
update profiles
set is_superadmin = true
where id = '<your auth.users id>';
```

- **Option B**: Use a one-off local script with `SUPABASE_SERVICE_ROLE_KEY` to set your profile’s `is_superadmin` to `true`.

Once you’ve done that, you can access `/admin` normally.

This project uses `next/font` to load fonts and Tailwind for styling.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
