# SFGC Calendar

A church calendar web app. Paste an event, Claude parses it, it lands on the church's Google Calendar. Homepage shows upcoming events read-only for visitors.

## Stack
- Next.js 15 (App Router) on Vercel
- Tailwind CSS
- Claude Haiku for paste-to-structured extraction
- Google Calendar API (single shared calendar, refresh-token auth)
- Password gate for the submit form

## Setup (one-time)

### 1. Google Calendar OAuth credentials
1. https://console.cloud.google.com/ → new project → enable **Google Calendar API**
2. **APIs & Services → Credentials → Create OAuth 2.0 Client ID** (Web application)
3. Authorized redirect URI: `https://developers.google.com/oauthplayground`
4. Save **Client ID** and **Client Secret**

### 2. Get a refresh token
1. Open https://developers.google.com/oauthplayground/
2. Gear icon → check **Use your own OAuth credentials** → paste client ID/secret
3. Left scope: `https://www.googleapis.com/auth/calendar.events`
4. **Authorize APIs** → sign in **with the Google account that owns the church calendar** → **Exchange authorization code for tokens**
5. Copy **refresh_token**

### 3. Calendar ID
- Google Calendar → hover the church calendar → **Settings and sharing** → scroll to **Integrate calendar** → copy **Calendar ID** (looks like `xxx@group.calendar.google.com`)
- Or use `primary` for the signed-in account's main calendar

### 4. Anthropic API key
- https://console.anthropic.com/ → API Keys → create one

### 5. Local dev
```bash
cp .env.example .env.local
# Fill in all values in .env.local
npm install
npm run dev
```
Visit http://localhost:3000 and http://localhost:3000/submit.

### 6. Deploy to Vercel
```bash
npm install -g vercel   # if not already
vercel                  # first run: create the project
vercel --prod
```
Then in the Vercel dashboard → your project → **Settings → Environment Variables**, add every key from `.env.example` with real values. Redeploy (`vercel --prod`) so they take effect.

## Environment variables

| Key | Example |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |
| `GOOGLE_REFRESH_TOKEN` | `1//0g...` |
| `GOOGLE_CALENDAR_ID` | `churchcalendar@group.calendar.google.com` or `primary` |
| `TIMEZONE` | `America/New_York` |
| `SUBMIT_PASSWORD` | anything you'll share with ministry leaders |

## How staff use it
1. Go to `/submit`
2. Paste something like *"Choir rehearsal Thursday Nov 20 at 7pm in the sanctuary"*
3. Enter the shared password, click **Preview**
4. Review the extracted fields (title, start, end, location, description) — edit anything wrong
5. Click **Add to Calendar** — event lands on the church calendar immediately

## How visitors see events
- Homepage `/` lists the next 25 upcoming events from the church calendar
- Each event links to its Google Calendar page (for RSVPs / details)
- Cache: 60 seconds

## Notes
- No approval queue — anyone with the password can post directly. If you add more ministry leaders and want moderation, add an "approved" flag and a queue page (ask later).
- No recurring events — every post creates a one-off. For recurring (weekly service etc.), set it up manually in Google Calendar once and it'll show up here.
- If the refresh token is ever revoked (Google account password change, "Remove access" in security settings), repeat step 2 to get a new one.
