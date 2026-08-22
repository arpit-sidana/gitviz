'use client';

import { FormEvent, useState } from 'react';

const demos = [
  ['PRODUCT / UI', 'Cal.com', 'Scheduling workflows, routes, and integrations', 'https://github.com/calcom/cal.com'],
  ['BUSINESS API', 'Saleor', 'Commerce domain, GraphQL API, and data model', 'https://github.com/saleor/saleor'],
  ['AI PLATFORM', 'Dify', 'Visual workflows, agents, and model infrastructure', 'https://github.com/langgenius/dify'],
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('Start with a curated example or paste any public GitHub repository.');
  const explore = (value: string) => {
    try {
      const parsed = new URL(value);
      if (parsed.hostname !== 'github.com' || parsed.pathname.split('/').filter(Boolean).length < 2) throw new Error();
      setNote(`Preview ready for ${parsed.pathname.replaceAll('/', ' / ').replace(/\.git$/, '')}. Repository analysis is next.`);
    } catch { setNote('Please enter a public GitHub repository URL.'); }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); explore(url.trim()); };
  return <main className="site-shell">
    <header className="topbar"><a className="brand" href="/">gitviz<span>.</span></a><div className="topbar-meta">Repository intelligence, with receipts</div></header>
    <section className="hero"><p className="eyebrow">PUBLIC REPOSITORY EXPLORER</p><h1>Build a mental model<br /><em>before you read every file.</em></h1><p className="hero-copy">GitViz turns a public GitHub repository into an interactive map of its product capabilities, implementation flows, architecture, and history.</p>
      <form className="repo-form" onSubmit={submit}><input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://github.com/owner/repository" aria-label="Public GitHub repository URL" required /><button type="submit">Explore repository <span>→</span></button></form><p className="form-note">{note}</p>
    </section>
    <section className="examples"><div className="section-heading"><p className="eyebrow">START WITH A DEMO</p><h2>Three ways to see the map</h2></div><div className="example-grid">{demos.map(([kicker, name, description, repo]) => <button className="example-card" key={name} onClick={() => { setUrl(repo); explore(repo); }}><span className="card-kicker">{kicker}</span><strong>{name}</strong><small>{description}</small><span className="card-arrow">↗</span></button>)}</div></section>
    <section className="principles"><div><span className="principle-number">01</span><strong>Follow the capability</strong><p>Start with what the product does, then trace it into code.</p></div><div><span className="principle-number">02</span><strong>Choose your depth</strong><p>Orientation, Trace, or Inspect. You decide how far to go.</p></div><div><span className="principle-number">03</span><strong>Trust the evidence</strong><p>Every material claim points back to source files or commits.</p></div></section>
    <footer className="footer">GitViz is a work in progress · <a href="https://github.com/arpit-sidana/gitviz">View the source on GitHub ↗</a></footer>
  </main>;
}
