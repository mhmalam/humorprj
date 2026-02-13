# Authentication Setup Instructions

## Supabase Configuration

To enable Google OAuth authentication, you need to configure it in your Supabase project:

### 1. Go to Supabase Dashboard
Navigate to: https://supabase.com/dashboard/project/qihsgnfjqmkjmoowyfbn

### 2. Configure Google OAuth Provider

1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Enable the Google provider
4. Add the Google OAuth Client ID:
   ```
   388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com
   ```
5. Leave the Client Secret empty (not required)
6. Set the **Redirect URL** to:
   ```
   https://qihsgnfjqmkjmoowyfbn.supabase.co/auth/v1/callback
   ```
7. Click **Save**

### 3. Configure Authorized Redirect URIs in Google Cloud Console

In your Google Cloud Console project, add these authorized redirect URIs:
- `http://localhost:3000/auth/callback` (for local development)
- `https://your-production-domain.com/auth/callback` (for production)
- `https://qihsgnfjqmkjmoowyfbn.supabase.co/auth/v1/callback` (Supabase callback)

### 4. Test the Authentication

1. Run your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should see the login gate
4. Click "Continue with Google"
5. After successful login, you'll be redirected to the home page with posts

## How It Works

- **LoginGate Component**: Shows when user is not authenticated
- **Auth Callback**: Handles the OAuth callback at `/auth/callback`
- **Middleware**: Refreshes user sessions automatically
- **Protected Route**: Main page checks for authentication before showing content

## Environment Variables

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://qihsgnfjqmkjmoowyfbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
