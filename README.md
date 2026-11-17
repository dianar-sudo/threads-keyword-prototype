# ThreadScout

A Next.js prototype for a Meta App Review walkthrough. It demonstrates Threads OAuth, the `threads_basic` permission, and a keyword search request using `threads_keyword_search`.

## Important before submitting to Meta

- This is a working prototype, not a mockup. Reviewers must be able to open the deployed app and follow the test steps below.
- Public keyword results may remain restricted until Meta grants Advanced Access for `threads_keyword_search`.
- Replace the contact placeholder on `/privacy` with a real support contact before submitting.
- This prototype does not persist searches or account data on a server. The long-lived access token is held in an encrypted, HTTP-only browser session cookie so server routes can make API calls.
- Do not commit `.env.local`, App Secret, tokens, or other credentials.

## Requirements

- Node.js 20 or later
- A Meta app with the **Access the Threads API** use case
- `threads_basic` and `threads_keyword_search` enabled for testing
- A public Threads account added as a Threads Tester and an accepted invitation
- A Vercel account for a public HTTPS deployment

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill the values described below.
3. Start the development server with `npm run dev`.
4. For the App Review walkthrough, use the public HTTPS callback URL registered in the Meta app. The easiest setup is to deploy to Vercel first.

## Deploy to Vercel

1. Put this project in a private GitHub repository, then import that repository from the Vercel dashboard.
2. Deploy once to receive a Vercel HTTPS URL, for example `https://threads-keyword-demo.vercel.app`.
3. In Vercel **Project → Settings → Environment Variables**, add the variables below for Production. Redeploy after changing variables.
4. In Meta **Use cases → Access the Threads API → Customize → Settings**, register:
   - Redirect callback URL: `https://YOUR-PROJECT.vercel.app/api/auth/threads/callback`
   - Deauthorize callback URL: `https://YOUR-PROJECT.vercel.app/api/meta/deauthorize`
   - Data deletion callback URL: `https://YOUR-PROJECT.vercel.app/api/meta/data-deletion`
5. Set the same redirect URL in `THREADS_REDIRECT_URI`, and the site origin in `APP_URL`. Redeploy.
6. Set Meta's privacy policy URL to `https://YOUR-PROJECT.vercel.app/privacy` and data deletion/status URL to `https://YOUR-PROJECT.vercel.app/data-deletion` where requested.
7. Keep the production deployment publicly accessible during App Review. Do not enable Vercel Deployment Protection for the review URL.

### Environment variables

| Variable | Value |
| --- | --- |
| `THREADS_APP_ID` | Threads App ID from the Threads use case settings |
| `THREADS_APP_SECRET` | Matching Threads App Secret; keep it private |
| `THREADS_REDIRECT_URI` | Exact deployed OAuth callback URL listed above |
| `THREADS_SESSION_SECRET` | A new random secret of at least 32 characters, not the Meta App Secret |
| `APP_URL` | Public origin, e.g. `https://threads-keyword-demo.vercel.app` |
| `THREADS_API_VERSION` | `v1.0` unless Meta directs the app to another version |

Generate a session secret locally with `openssl rand -hex 32`. Do not paste it or `THREADS_APP_SECRET` into source code or a public repository.

## Meta app setup

1. Add `threads_basic` and `threads_keyword_search` under the Threads use case's permissions and features.
2. Add the review/test Threads account as a Threads Tester and accept the invitation under Threads **Settings → Account → Website permissions → Invites**.
3. For searches of other people's public posts, submit `threads_keyword_search` for Advanced Access through **App Review → Permissions and Features**. Standard access may only return the authenticated user's own posts.
4. Keep the app's OAuth request scopes aligned with the permissions in the review request.

## Suggested reviewer walkthrough

1. Open the deployed home page and select **Connect Threads**.
2. Sign in with the supplied Threads test account and approve the requested permissions.
3. Confirm the connected username appears on the page.
4. Search for a keyword and open a result's **View on Threads** link.
5. Select **Disconnect** and confirm the app returns to its disconnected state.
6. Visit **Privacy policy** and **Data deletion** from the footer.

Record an end-to-end screencast of this walkthrough. If Advanced Access has not yet been granted, explain in the review notes that the search response is limited to the test profile's own posts until Meta approves the permission.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Connect Threads and search posts |
| `/api/auth/threads` | Start OAuth and create a CSRF state |
| `/api/auth/threads/callback` | Verify state, exchange authorization code, create an encrypted session |
| `/api/search` | Call Threads `keyword_search` from the server |
| `/api/session` | Return connected profile metadata without returning the token |
| `/api/disconnect` | Clear the browser session |
| `/api/meta/deauthorize` | Verify Meta's signed deauthorization callback |
| `/api/meta/data-deletion` | Verify Meta's signed deletion callback and return a status URL/code |
| `/privacy` | Privacy policy and operator contact placeholder |
| `/data-deletion` | Public deletion status page |
