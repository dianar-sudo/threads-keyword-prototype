export default function PrivacyPage() {
  return (
    <main className="document-shell">
      <a className="back-link" href="/">← Back to search</a>
      <div className="eyebrow">THREADSCOUT</div>
      <h1>Privacy policy</h1>
      <p className="updated">Last updated: November 17, 2026</p>

      <h2>What this prototype does</h2>
      <p>This demonstration connects a Threads profile and sends keyword search requests to the Threads API after the profile owner authorizes the requested permissions.</p>

      <h2>Information used</h2>
      <p>The prototype receives the Threads user ID, username, access token, and search results needed to provide the connection and search features. Search terms are sent to the Threads API when you submit a search.</p>

      <h2>Storage and retention</h2>
      <p>The access token is kept in an encrypted, HTTP-only session cookie in your browser so the server can make authorized API requests. This prototype does not maintain a server-side database of profiles, tokens, search terms, or search results. Disconnecting removes the local session cookie. Meta may process requests according to its own policies.</p>

      <h2>Disconnect and deletion</h2>
      <p>You can disconnect your Threads profile using the Disconnect button on the search page. To request deletion or ask a question about this prototype, contact the app operator through the contact channel provided with the App Review submission.</p>

      <h2>Contact</h2>
      <p>App operator: replace this line with the responsible person or organization and a working contact email before submitting to Meta.</p>
    </main>
  );
}
