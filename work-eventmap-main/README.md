# Event Map (Campus Compass)

React + Vite + Tailwind app: a public campus map of facilities and activities, with an admin panel. Backend: [Supabase](https://supabase.com) (database, auth, photo storage).

## 1. Prerequisites

- [Node.js 20+](https://nodejs.org) (check with `node -v`)
- [VS Code](https://code.visualstudio.com) and a free [Supabase](https://supabase.com) account
- Optional: [Git](https://git-scm.com) and a GitHub account (needed for deploying)

## 2. Create the Supabase backend (one time)

1. Supabase dashboard > **New project**. Save the database password somewhere.
2. **SQL Editor > New query**, paste all of `supabase/migrations/001_init.sql`, click **Run**. This creates the tables, security rules and the `facility-photos` bucket.
3. **Project Settings > API**: copy the **Project URL** and the **anon public** key.
4. **Authentication > Providers > Email**: keep it enabled with "Confirm email" on.
5. **Authentication > Email Templates > Confirm signup**: the sign-up screen asks for a 6-digit code, so make the template body contain `{{ .Token }}`, for example:
   `<p>Your verification code is {{ .Token }}</p>`
6. Optional, for "Continue with Google": **Authentication > Providers > Google**, then add your Google OAuth client ID and secret.

## 3. Run it in VS Code

1. Unzip the project, then **File > Open Folder** and choose it.
2. Open the terminal with **Ctrl+`** (Mac: **Cmd+`**).
3. Create your env file:
   ```bash
   cp .env.example .env        # Windows PowerShell: copy .env.example .env
   ```
   Open `.env` and paste in your Supabase URL and anon key.
4. Install and start:
   ```bash
   npm install
   npm run dev
   ```
5. Open the address it prints (normally http://localhost:5173).

Other commands: `npm run build` (production build into `dist/`), `npm run preview` (serve that build), `npm run lint`.

Recommended VS Code extensions: ESLint, Tailwind CSS IntelliSense.

## 4. Make yourself an admin

1. In the running app, go to `/register` and create your account (enter the emailed code).
2. In Supabase **SQL Editor**, run:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
3. Reload the app and open `/admin`. You can now add facilities, activities and photos.

## 5. Deploy (Vercel)

1. Push the project to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```
   `.env` is gitignored, so your keys are not uploaded.
2. At [vercel.com](https://vercel.com): **Add New > Project**, import the repo. The Vite settings are detected automatically.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as your `.env`, then **Deploy**.
4. Copy your live URL (e.g. `https://your-app.vercel.app`) and set it in Supabase **Authentication > URL Configuration**: put it in **Site URL** and add it, plus `http://localhost:5173`, to **Redirect URLs**. Without this, password-reset and Google sign-in links will not work.

`vercel.json` makes page refreshes on routes like `/admin` work. Netlify also works: build command `npm run build`, publish directory `dist`; `public/_redirects` handles routing.

## Troubleshooting

- **Blank page or "Missing VITE_SUPABASE_URL"**: `.env` is missing or you did not restart `npm run dev` after editing it.
- **Facilities do not save, "make sure you are signed in as an admin"**: your account is not an admin yet (step 4), or you are signed out.
- **No verification email**: check spam; the free Supabase email service is rate-limited. For real use, add custom SMTP under Authentication > SMTP Settings.
- **Reset-password link says invalid**: the redirect URL in step 5.4 is missing.
