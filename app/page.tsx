'use client';

import { FormEvent, useMemo, useState } from 'react';
import { demos } from '@/lib/demo-data';
import type { Depth, GraphNode, Tab } from '@/lib/graph';

const tabs: { id: Tab; label: string; question: string }[] = [
  { id: 'overview', label: 'Overview', question: 'What is this?' },
  { id: 'flow', label: 'Product Flow', question: 'How does it work?' },
  { id: 'architecture', label: 'Architecture', question: 'What connects?' },
  { id: 'evolution', label: 'Evolution', question: 'What changed?' },
  { id: 'evaluation', label: 'Evaluation', question: 'Can I trust it?' },
];

const depthCopy: Record<Depth, string> = {
  orientation: 'Purpose and major capabilities',
  trace: 'End-to-end implementation paths',
  inspect: 'Files, lines, commits, and provenance',
};

const nodeTone: Record<GraphNode['type'], string> = {
  UI_SURFACE: 'violet', ENDPOINT: 'blue', SERVICE: 'lime', DATA_STORE: 'orange',
  JOB: 'pink', EXTERNAL_DEPENDENCY: 'cyan', FEATURE: 'yellow',
};

export default function Home() {
  const [repoIndex, setRepoIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('overview');
  const [depth, setDepth] = useState<Depth>('orientation');
  const [capabilityId, setCapabilityId] = useState(demos[0].capabilities[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [message, setMessage] = useState('');
  const graph = demos[repoIndex];
  const capability = graph.capabilities.find((item) => item.id === capabilityId) ?? graph.capabilities[0];
  const visibleNodes = useMemo(() => {
    if (tab === 'architecture') return graph.nodes;
    return capability.nodeIds.map((id) => graph.nodes.find((node) => node.id === id)).filter(Boolean) as GraphNode[];
  }, [capability, graph, tab]);
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? null;

  const selectRepo = (index: number) => {
    setRepoIndex(index); setCapabilityId(demos[index].capabilities[0].id);
    setSelectedNodeId(null); setTab('overview'); setMessage('');
  };

  const submitRepo = (event: FormEvent) => {
    event.preventDefault();
    const index = demos.findIndex((demo) => repoUrl.replace(/\/$/, '').toLowerCase() === demo.repository.url.toLowerCase());
    if (index >= 0) { selectRepo(index); setMessage('Loaded the precomputed evidence snapshot.'); }
    else setMessage('Live ingestion is not enabled yet. Choose one of the three evidence-backed demos.');
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="/">gitviz<span>.</span></a>
        <form className="repo-search" onSubmit={submitRepo}>
          <span aria-hidden="true">⌘</span>
          <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} aria-label="Public GitHub repository URL" placeholder="Paste a public GitHub URL" />
          <button type="submit">Analyze</button>
        </form>
        <a className="github-link" href="https://github.com/arpit-sidana/gitviz">GitHub ↗</a>
      </header>

      {message && <div className="notice" role="status">{message}</div>}

      <section className="workspace-head">
        <div>
          <div className="repo-switcher" aria-label="Demo repository">
            {demos.map((demo, index) => <button key={demo.repository.name} className={repoIndex === index ? 'active' : ''} onClick={() => selectRepo(index)}>{demo.repository.name}</button>)}
          </div>
          <p className="repo-path">github.com / {graph.repository.owner} / <strong>{graph.repository.name}</strong></p>
          <h1>{graph.repository.purpose}</h1>
          <div className="repo-meta"><span className="status-dot" /> Precomputed snapshot <span>·</span> {graph.repository.languages.join(' / ')} <span>·</span> {graph.nodes.length} nodes</div>
        </div>
        <div className="depth-control">
          <span className="control-label">DEPTH</span>
          <div className="segmented">{(['orientation','trace','inspect'] as Depth[]).map((item) => <button key={item} className={depth === item ? 'active' : ''} onClick={() => setDepth(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
          <small>{depthCopy[depth]}</small>
        </div>
      </section>

      <nav className="tabs" aria-label="Repository views">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setSelectedNodeId(null); }}><strong>{item.label}</strong><small>{item.question}</small></button>)}</nav>

      <section className="content-grid">
        <div className="main-panel">
          {tab === 'overview' && <Overview graph={graph} onCapability={(id) => { setCapabilityId(id); setTab('flow'); }} depth={depth} />}
          {tab === 'flow' && <Flow graph={graph} capabilityId={capability.id} setCapabilityId={setCapabilityId} nodes={visibleNodes} onNode={setSelectedNodeId} depth={depth} />}
          {tab === 'architecture' && <Architecture graph={graph} onNode={setSelectedNodeId} selectedNodeId={selectedNodeId} depth={depth} />}
          {tab === 'evolution' && <Evolution graph={graph} depth={depth} />}
          {tab === 'evaluation' && <Evaluation graph={graph} onNode={setSelectedNodeId} depth={depth} />}
        </div>
        <aside className="evidence-panel">
          <div className="panel-heading"><span>Evidence</span><span className="evidence-count">{selectedNode?.evidence.length ?? 0}</span></div>
          {selectedNode ? <>
            <span className={`type-pill ${nodeTone[selectedNode.type]}`}>{selectedNode.type.replaceAll('_',' ')}</span>
            <h2>{selectedNode.label}</h2><p>{selectedNode.detail}</p>
            {selectedNode.evidence.map((item) => <article className="evidence-card" key={item.path}>
              <div className="file-icon">F</div><div><code>{item.path}</code>{item.lines && <small>Lines {item.lines}</small>}<p>{item.note}</p><span>Commit {item.commitSha.slice(0,12)}</span></div>
            </article>)}
            <div className="confidence"><span>Derivation</span><strong>Deterministic</strong><span>Confidence</span><strong>High</strong></div>
          </> : <div className="empty-evidence"><span>⌁</span><p>Select a component or evaluation result to inspect its source evidence.</p></div>}
        </aside>
      </section>
      <footer><span>Schema v{graph.schemaVersion}</span><span>Evidence-backed · No runtime tracing · Work in progress</span></footer>
    </main>
  );
}

function Overview({ graph, onCapability, depth }: { graph: (typeof demos)[number]; onCapability: (id:string)=>void; depth:Depth }) {
  return <div className="view"><div className="view-title"><p>REPOSITORY ORIENTATION</p><h2>Start with what the product does.</h2><span>The graph stays underneath until you choose to go deeper.</span></div>
    <div className="metric-row"><div><strong>{graph.capabilities.length}</strong><span>capabilities</span></div><div><strong>{graph.nodes.length}</strong><span>components</span></div><div><strong>{graph.edges.length}</strong><span>relationships</span></div><div><strong>{graph.evaluations.filter(e=>e.status==='passed').length}/4</strong><span>checks passed</span></div></div>
    <h3>Primary capabilities</h3><div className="capability-grid">{graph.capabilities.map((item,index)=><button key={item.id} onClick={()=>onCapability(item.id)}><span>0{index+1}</span><strong>{item.name}</strong><p>{item.summary}</p><em>Trace capability →</em></button>)}</div>
    {depth !== 'orientation' && <section className="analysis-note"><strong>Analysis coverage</strong><p>{graph.repository.limitations.join(' ')}</p></section>}
  </div>;
}

function Flow({ graph, capabilityId, setCapabilityId, nodes, onNode, depth }: { graph:(typeof demos)[number]; capabilityId:string; setCapabilityId:(id:string)=>void; nodes:GraphNode[]; onNode:(id:string)=>void; depth:Depth }) {
  const cap=graph.capabilities.find(c=>c.id===capabilityId)!;
  return <div className="view"><div className="view-title"><p>PRODUCT FLOW</p><h2>{cap.name}</h2><span>{cap.summary}</span></div>
    <div className="cap-tabs">{graph.capabilities.map(c=><button className={c.id===capabilityId?'active':''} key={c.id} onClick={()=>setCapabilityId(c.id)}>{c.name}</button>)}</div>
    <div className="flow-canvas">{nodes.map((node,index)=><div className="flow-step" key={node.id}>{index>0&&<span className="connector">→</span>}<button onClick={()=>onNode(node.id)}><span className={`node-mark ${nodeTone[node.type]}`}>{index+1}</span><small>{node.type.replaceAll('_',' ')}</small><strong>{node.label}</strong>{depth!=='orientation'&&<p>{node.detail}</p>}{depth==='inspect'&&<code>{node.evidence[0]?.path}</code>}</button></div>)}</div>
    <p className="canvas-caption">Select any component to inspect the evidence behind this path.</p>
  </div>;
}

function Architecture({ graph, onNode, selectedNodeId, depth }: { graph:(typeof demos)[number]; onNode:(id:string)=>void; selectedNodeId:string|null; depth:Depth }) {
  const shown=depth==='orientation'?graph.nodes.slice(0,5):graph.nodes;
  return <div className="view"><div className="view-title"><p>SYSTEM STRUCTURE</p><h2>Architecture map</h2><span>{shown.length} visible components · select a node for provenance</span></div>
    <div className="legend">{Object.entries(nodeTone).map(([type,tone])=><span key={type}><i className={tone}/>{type.replaceAll('_',' ')}</span>)}</div>
    <div className="arch-canvas"><div className="arch-lines" aria-hidden="true"/><div className="node-cloud">{shown.map((node,index)=><button style={{'--i':index} as React.CSSProperties} className={selectedNodeId===node.id?'selected':''} key={node.id} onClick={()=>onNode(node.id)}><span className={`node-mark ${nodeTone[node.type]}`}>{index+1}</span><strong>{node.label}</strong><small>{node.type.replaceAll('_',' ')}</small>{depth==='inspect'&&<code>{node.evidence[0]?.path.split('/').pop()}</code>}</button>)}</div></div>
  </div>;
}

function Evolution({ graph, depth }: { graph:(typeof demos)[number]; depth:Depth }) {
  return <div className="view"><div className="view-title"><p>HISTORICAL EVIDENCE</p><h2>How the project evolved</h2><span>Observed changes only. GitViz does not forecast what changes next.</span></div>
    <div className="timeline">{graph.evolution.map((event,index)=><article key={event.commitSha}><div className="time-rail"><span>{event.date}</span><i/></div><div className="event-card"><span className="event-index">0{index+1}</span><div><h3>{event.title}</h3><p>{event.detail}</p><small>{event.files} files changed{depth==='inspect'&&` · commit ${event.commitSha}`}</small></div></div></article>)}</div>
  </div>;
}

function Evaluation({ graph, onNode, depth }: { graph:(typeof demos)[number]; onNode:(id:string)=>void; depth:Depth }) {
  return <div className="view"><div className="view-title"><p>KNOWN-ANSWER CHECKS</p><h2>Trust, made inspectable.</h2><span>These checks test whether GitViz can answer the specific comprehension job without guessing.</span></div>
    <div className="eval-summary"><strong>{graph.evaluations.filter(e=>e.status==='passed').length} passed</strong><span>of {graph.evaluations.length} launch checks</span><div><i style={{width:`${graph.evaluations.filter(e=>e.status==='passed').length/graph.evaluations.length*100}%`}}/></div></div>
    <div className="eval-list">{graph.evaluations.map((item,index)=><article key={item.question}><span className={`check ${item.status}`}>{item.status==='passed'?'✓':'!'}</span><div><small>CHECK 0{index+1}</small><h3>{item.question}</h3><p>{item.answer}</p>{depth!=='orientation'&&<div className="evidence-links">{item.evidenceIds.map(id=><button key={id} onClick={()=>onNode(id)}>{graph.nodes.find(n=>n.id===id)?.label} ↗</button>)}{!item.evidenceIds.length&&<span>No supporting runtime evidence</span>}</div>}</div></article>)}</div>
  </div>;
}
