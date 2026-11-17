type Props = { searchParams: Promise<{ code?: string }> };

export default async function DataDeletionPage({ searchParams }: Props) {
  const { code } = await searchParams;
  return (
    <main className="document-shell">
      <a className="back-link" href="/">← Back to search</a>
      <div className="eyebrow">THREADS KEYWORD SEARCH DEMO</div>
      <h1>Data deletion status</h1>
      {code ? (
        <>
          <p>This prototype does not keep profile data, search terms, or search results in a server-side database. The deletion callback has been received and no stored app data remains to delete.</p>
          <p className="code-line">Confirmation code: <code>{code}</code></p>
        </>
      ) : (
        <p>To disconnect your account and clear this browser session, return to the search page and select Disconnect.</p>
      )}
    </main>
  );
}
