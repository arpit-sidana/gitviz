import type { GraphNode, RepositoryGraph } from '../lib/graph';

export function EvidencePanel({graph,selected,close}:{graph:RepositoryGraph;selected:GraphNode|null;close:()=>void}) {
  return <aside className="evidence-panel" aria-label="Selected component details"><div className="panel-heading"><span>Component details</span>{selected&&<button onClick={close} aria-label="Close component details">×</button>}</div>{selected?<>
    <span className={`basis ${selected.basis==='assumption'?'assumption':''}`}>{selected.basis==='assumption'?'Proposed architecture':'In repository · verified file'}</span>
    <h2>{selected.label}</h2><p>{selected.detail}</p>
    <div className="confidence"><span>Confidence</span><strong>{selected.basis==='assumption'?'Design assumption':'Curated interpretation'}</strong></div>
    {selected.architectureDetails?.map((d,i)=><div key={i} className="architecture-detail"><span className={d.basis==='repository'?'fact-tag':'proposal-tag'}>{d.basis==='repository'?'REPOSITORY FACT':'PROPOSED'}</span><h3>{d.label}</h3><p>{d.value}</p></div>)}
    {selected.evidence.length>0&&<h3 className="source-heading">Repository evidence</h3>}
    {selected.basis==='assumption'&&selected.evidence.length>0&&<p>These files support the application or runtime component. Its AWS placement remains a proposal.</p>}
    {selected.evidence.map(item=><article className="evidence-card" key={item.path}><a href={`${graph.repository.url}/blob/${item.commitSha}/${item.path.split('/').map(encodeURIComponent).join('/')}`} target="_blank" rel="noreferrer"><code>{item.path}</code> ↗</a><p>{item.note}</p><small>Revision {item.commitSha.slice(0,7)}</small></article>)}
    {!selected.evidence.length&&<p>No repository file establishes this resource. It is part of the proposed deployment design.</p>}
    {selected.references&&<div className="architecture-reading"><strong>Design references</strong>{selected.references.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a>)}</div>}
    <p className="muted">Verified files do not establish a live production topology.</p>
  </>:<div className="empty-evidence"><span aria-hidden="true">⌁</span><p>Select a component or connection to inspect the source facts, protocols and design assumptions.</p></div>}</aside>;
}
