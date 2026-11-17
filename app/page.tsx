"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

type SearchPost = {
  id?: string;
  text?: string;
  username?: string;
  permalink?: string;
  timestamp?: string;
  media_type?: string;
};

type SessionInfo = { connected: boolean; username?: string; expiresAt?: number };

export default function HomePage() {
  const [session, setSession] = useState<SessionInfo>({ connected: false });
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: SessionInfo) => { if (active) setSession(data); })
      .catch(() => { if (active) setError("Could not check the Threads connection. Reload the page and try again."); })
      .finally(() => { if (active) setLoaded(true); });
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) setError(authError);
    if (params.has("connected")) window.history.replaceState({}, "", "/");
    return () => { active = false; };
  }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPosts([]);
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await response.json() as { data?: SearchPost[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Search failed. Please try again.");
      setPosts(data.data || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    await fetch("/api/disconnect", { method: "POST" });
    setSession({ connected: false });
    setPosts([]);
    setError("");
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="ThreadScout home">
          <Image className="brand-icon" src="/threadscout-icon.svg" alt="" width={32} height={32} priority /> ThreadScout
        </a>
        <a className="text-link" href="/privacy">Privacy</a>
      </header>

      <section className="hero">
        <div className="eyebrow">META THREADS API · REVIEW PROTOTYPE</div>
        <h1>Find public conversations<br />by keyword</h1>
        <p className="hero-copy">Connect a Threads profile, search for a term, and review matching posts with links to their original conversations.</p>
      </section>

      <section className="panel connection-panel" aria-labelledby="connection-heading">
        <div className="panel-heading">
          <div>
            <div className="step-label">STEP 1</div>
            <h2 id="connection-heading">Connect a Threads profile</h2>
          </div>
          {loaded && session.connected && <span className="status"><span className="status-dot" />Connected</span>}
        </div>
        {session.connected ? (
          <div className="connected-row">
            <div className="account-avatar">@</div>
            <div className="account-copy"><strong>@{session.username || "Threads user"}</strong><span>Authorized for this session</span></div>
            <button className="button button-secondary" onClick={disconnect} type="button">Disconnect</button>
          </div>
        ) : (
          <div className="connect-row">
            <p>Sign in to Threads and approve the requested permissions to continue.</p>
            <a className="button button-primary" href="/api/auth/threads">Connect Threads <span aria-hidden="true">↗</span></a>
          </div>
        )}
        <div className="permission-note"><strong>Requested permissions</strong><span><code>threads_basic</code> · <code>threads_keyword_search</code></span></div>
      </section>

      <section className={`panel search-panel ${session.connected ? "" : "panel-muted"}`} aria-labelledby="search-heading">
        <div className="panel-heading">
          <div>
            <div className="step-label">STEP 2</div>
            <h2 id="search-heading">Search Threads posts</h2>
          </div>
        </div>
        <form className="search-form" onSubmit={search}>
          <label className="sr-only" htmlFor="keyword">Keyword to search</label>
          <input id="keyword" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={250} placeholder="Enter a keyword, e.g. climate" required disabled={!session.connected || loading} />
          <button className="button button-primary" type="submit" disabled={!session.connected || loading || !query.trim()}>{loading ? "Searching…" : "Search"}</button>
        </form>
        <p className="hint">Search uses the Threads Keyword Search API. Results depend on the permissions and access level approved for this app.</p>
        {!session.connected && <p className="locked-note">Connect a Threads profile to enable search.</p>}
        {error && <div className="error-box" role="alert">{error}</div>}
        {posts.length > 0 && <div className="results-heading"><h3>Results</h3><span>{posts.length} posts</span></div>}
        <div className="results-list">
          {posts.map((post, index) => (
            <article className="result-card" key={post.id || `${post.permalink}-${index}`}>
              <div className="result-meta"><strong>@{post.username || "Threads user"}</strong><span>{post.timestamp ? new Date(post.timestamp).toLocaleString() : ""}</span></div>
              <p>{post.text || "This post has no text."}</p>
              {post.media_type && <span className="media-label">{post.media_type.replaceAll("_", " ").toLowerCase()}</span>}
              {post.permalink && <a className="result-link" href={post.permalink} target="_blank" rel="noreferrer">View on Threads <span aria-hidden="true">↗</span></a>}
            </article>
          ))}
        </div>
        {posts.length === 0 && !loading && !error && session.connected && <div className="empty-state">Enter a keyword above to search posts.</div>}
      </section>

      <aside className="review-note">
        <span className="info-icon">i</span>
        <p>Until Meta approves Advanced Access for <code>threads_keyword_search</code>, results may be limited to posts owned by the connected profile.</p>
      </aside>

      <footer className="footer"><span>ThreadScout</span><a href="/data-deletion">Data deletion</a><a href="/privacy">Privacy policy</a></footer>
    </main>
  );
}
