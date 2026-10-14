'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import snapshots from '@/lib/snapshots/demos.json';
import type { Depth, GraphNode, RepositoryGraph, Tab } from '@/lib/graph';
import { normalizeRepositoryUrl } from '@/lib/repository-url';
import { ArchitectureExplorer } from '@/components/architecture-explorer';
import { EvidencePanel } from '@/components/evidence-panel';

const demos = snapshots as RepositoryGraph[];
const tabs: { id: Tab; label: string; question: string }[] = [
  { id: 'overview', label: 'Overview', question: 'What does the product do?' },
  { id: 'flow', label: 'Product Flow', question: 'Follow a user journey' },
  { id: 'architecture', label: 'Architecture', question: 'Explore the system' },
  { id: 'evolution', label: 'Evolution', question: 'Features and pull requests' },
  { id: 'evaluation', label: 'Sources & limits', question: 'What supports this map?' },
];
const details: { id: Depth; label: string; help: string }[] = [
  { id: 'orientation', label: 'Summary', help: 'Shows the product story and component names. Click any component to see its sources.' },
  { id: 'trace', label: 'How it works', help: 'Adds each component’s role and the handoffs between them.' },
  { id: 'inspect', label: 'Source files', help: 'Adds source paths, pinned revisions, and PR file details for a closer look.' },
];
const typeName = (node: GraphNode) => node.type.replaceAll('_', ' ').toLowerCase();
const fileUrl = (graph: RepositoryGraph, path: string, sha = graph.repository.commitSha) => `${graph.repository.url}/blob/${sha}/${path.split('/').map(encodeURIComponent).join('/')}`;
const date = (value: string) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => { let saved: string | null = null; try { saved = localStorage.getItem('gitviz-theme'); } catch {} const value = saved === 'dark' || saved === 'light' ? saved : media.matches ? 'dark' : 'light'; setTheme(value); document.documentElement.dataset.theme = value; };
    sync(); media.addEventListener('change', sync); return () => media.removeEventListener('change', sync);
  }, []);
  const toggle = () => { const value = theme === 'light' ? 'dark' : 'light'; setTheme(value); document.documentElement.dataset.theme = value; try { localStorage.setItem('gitviz-theme', value); } catch {} };
  return <button className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'} onClick={toggle}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span><span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>;
}

export default function Home() {
  const [repoIndex, setRepoIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('overview');
  const [depth, setDepth] = useState<Depth>('trace');
  const [capId, setCapId] = useState(demos[0].capabilities[0].id);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [message, setMessage] = useState('');
  const graph = demos[repoIndex];
  const cap = graph.capabilities.find(c => c.id === capId) ?? graph.capabilities[0];
  const selectRepo = (index: number) => { setRepoIndex(index); setCapId(demos[index].capabilities[0].id); setSelected(null); setMessage(''); };
  const submitRepo = (event: FormEvent) => {
    event.preventDefault(); const url = normalizeRepositoryUrl(repoUrl);
    if (!url) { setMessage('Enter a repository URL such as https://github.com/saleor/saleor.'); return; }
    const canonical = url === 'https://github.com/calcom/cal.com' ? 'https://github.com/calcom/cal.diy' : url;
    const index = demos.findIndex(d => d.repository.url.toLowerCase() === canonical);
    if (index >= 0) { selectRepo(index); setMessage('Demo loaded. This is a saved, curated snapshot.'); }
    else setMessage('Live ingestion is still in development. Explore one of the three demo projects below.');
  };
  return <main className="app-shell">
    <header className="app-header"><a className="brand" href="./">gitviz<span>.</span></a><form className="repo-search" onSubmit={submitRepo}><input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} aria-label="GitHub repository URL" placeholder="Open a demo by GitHub URL"/><button>Open</button></form><div className="header-actions"><a href="https://github.com/arpit-sidana/gitviz" target="_blank" rel="noreferrer">GitViz repo ↗</a><ThemeToggle/></div></header>
    {message && <div className="notice" role="status">{message}</div>}
    <section className="workspace-head"><div className="repo-intro"><p className="eyebrow">THREE DEMO PROJECTS <span>· Live ingestion coming later</span></p><div className="repo-switcher" aria-label="Demo projects">{demos.map((demo, index) => <div className={`demo-choice ${index === repoIndex ? 'active' : ''}`} key={demo.repository.name}><button aria-pressed={index === repoIndex} onClick={() => selectRepo(index)}>{demo.repository.name.startsWith('cal.') ? 'Cal.com / Cal.diy' : demo.repository.name === 'dify' ? 'Dify' : 'Saleor'}</button><a href={demo.repository.url} aria-label={`Open ${demo.repository.name} on GitHub`} target="_blank" rel="noreferrer">↗</a></div>)}</div><a className="repo-path" href={graph.repository.url} target="_blank" rel="noreferrer">{graph.repository.owner}/{graph.repository.name} ↗</a><h1>{graph.repository.purpose}</h1><div className="repo-meta">Curated demo <span>·</span> {graph.repository.languages.join(' / ')} <span>·</span><a href={`${graph.repository.url}/tree/${graph.repository.commitSha}`} target="_blank" rel="noreferrer">Source revision {graph.repository.commitSha.slice(0,7)} ↗</a></div></div><div className="depth-control"><span className="control-label">AMOUNT OF DETAIL</span><div className="segmented">{details.map(item => <button key={item.id} aria-pressed={depth === item.id} className={depth === item.id ? 'active' : ''} onClick={() => setDepth(item.id)}>{item.label}</button>)}</div><p>{details.find(d => d.id === depth)?.help}</p></div></section>
    <nav className="tabs" aria-label="Repository views">{tabs.map(item => <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setSelected(null); }}><strong>{item.label}</strong><small>{item.question}</small></button>)}</nav>
    <section className={`content-grid ${tab === 'architecture' ? 'wide-map' : ''}`}><div className="main-panel">
      {tab === 'overview' && <Overview graph={graph} onCapability={id => { setCapId(id); setTab('flow'); setSelected(null); }}/ >}
      {tab === 'flow' && <Flow graph={graph} capId={cap.id} setCapId={id => {setCapId(id);setSelected(null);}} onNode={setSelected} depth={depth}/>}
      {tab === 'architecture' && <ArchitectureExplorer key={graph.repository.name} graph={graph} onNode={setSelected} onClear={()=>setSelected(null)} selectedId={selected?.id} depth={depth} application={<Architecture graph={graph} onNode={setSelected} selectedId={selected?.id} depth={depth}/>}/>}
      {tab === 'evolution' && <Evolution key={graph.repository.name} graph={graph} depth={depth}/>}
      {tab === 'evaluation' && <Sources graph={graph} onNode={setSelected}/>}
    </div><EvidencePanel graph={graph} selected={selected} close={()=>setSelected(null)}/></section>
    <footer><span>GitViz · Work in progress</span><span>Offline demos · Sources captured {date(graph.repository.snapshotDate!)}</span></footer>
  </main>;
}

function Title({label,title,children}:{label:string;title:string;children:React.ReactNode}) { return <div className="view-title"><p>{label}</p><h2>{title}</h2><div>{children}</div></div>; }
function Overview({graph,onCapability}:{graph:RepositoryGraph;onCapability:(id:string)=>void}) {
 return <div className="view"><Title label="PRODUCT OVERVIEW" title="Start with what people can do.">Choose a capability to follow the implementation. These are curated examples of the product’s core journeys.</Title><div className="metric-row"><div><strong>{graph.capabilities.length}</strong><span>product capabilities</span></div><div><strong>{graph.nodes.length}</strong><span>mapped components</span></div><div><strong>{graph.edges.length}</strong><span>interpreted connections</span></div></div><h3>Primary capabilities</h3><div className="capability-grid">{graph.capabilities.map((c,i)=><button key={c.id} onClick={()=>onCapability(c.id)}><span>0{i+1}</span><strong>{c.name}</strong><p>{c.summary}</p><em>Follow this flow →</em></button>)}</div><section className="analysis-note"><strong>About this demo</strong><p>Source locations are pinned to a real repository revision. Product labels and connections are curated interpretations. This is a sample map, not exhaustive repository analysis.</p></section></div>;
}
function Flow({graph,capId,setCapId,onNode,depth}:{graph:RepositoryGraph;capId:string;setCapId:(id:string)=>void;onNode:(n:GraphNode)=>void;depth:Depth}) {
 const cap=graph.capabilities.find(c=>c.id===capId)!;
 return <div className="view"><Title label="PRODUCT FLOW" title={cap.name}>{cap.summary}</Title><div className="cap-tabs">{graph.capabilities.map(c=><button key={c.id} aria-pressed={capId===c.id} className={capId===c.id?'active':''} onClick={()=>setCapId(c.id)}>{c.name}</button>)}</div><div className="flow-canvas">{cap.nodeIds.map((id,i)=>{const n=graph.nodes.find(node=>node.id===id)!;const prev=cap.nodeIds[i-1];const edge=graph.edges.find(e=>e.source===prev&&e.target===id);return <div className="flow-step" key={id}>{i>0&&<div className="connector"><span>{edge?edge.type.replaceAll('_',' ').toLowerCase():'journey step'}</span>→</div>}<button onClick={()=>onNode(n)}><span className={`node-mark tone-${n.type}`}>{i+1}</span><small>{typeName(n)}</small><strong>{n.label}</strong>{depth!=='orientation'&&<p>{n.detail}</p>}{depth==='inspect'&&<code>{n.evidence[0]?.path}</code>}</button></div>;})}</div><p className="canvas-caption">Numbered steps explain the journey. Connections are curated; selecting a box opens its pinned source.</p></div>;
}

function Architecture({graph,onNode,selectedId,depth}:{graph:RepositoryGraph;onNode:(n:GraphNode)=>void;selectedId?:string;depth:Depth}) {
 const [context,setContext]=useState(true); const [zoom,setZoom]=useState(1);
 const [layer,setLayer]=useState('all');
 const zone=(n:GraphNode)=>n.zone??(n.type==='UI_SURFACE'?'clients':n.type==='DATA_STORE'?'data':n.type==='EXTERNAL_DEPENDENCY'?'external':'application');
 const assumptions:GraphNode[]=[{id:'context-client',type:'UI_SURFACE',label:'Browser / API consumer',detail:'A consumer of the application API. Saleor’s storefront and dashboard are separate projects; other demos include UI code. This node provides the consumer context.',basis:'assumption',zone:'clients',evidence:[]},{id:'context-ingress',type:'SERVICE',label:'TLS ingress / reverse proxy',detail:'Reference deployment assumption: an ingress terminates HTTPS and forwards requests. No AWS service, cloud account, VPC, or public endpoint is established by this map.',basis:'assumption',zone:'clients',evidence:[]}];
 const layerNodes=graph.nodes.filter(n=>layer==='all'||(layer==='deployment'?(n.id.startsWith('compose-')||n.id==='deployment'):(!n.id.startsWith('compose-')&&n.id!=='deployment')));
 const nodes=context?[...assumptions,...layerNodes]:layerNodes;
 const zones=[{id:'clients',title:'Client & ingress',subtitle:'Entry into the application'},{id:'application',title:'Application boundary',subtitle:'Code and deployment examples'},{id:'data',title:'State & persistence',subtitle:'Logical models / storage boundaries'},{id:'external',title:'External systems',subtitle:'Providers outside the application'}];
 const positions=new Map<string,{x:number;y:number}>(); let height=520;
 zones.forEach((z,i)=>{const list=nodes.filter(n=>zone(n)===z.id);height=Math.max(height,list.length*152+110);list.forEach((n,j)=>positions.set(n.id,{x:i*290+24,y:100+j*152}));});
 const target=layerNodes.find(n=>n.type==='ENDPOINT')??layerNodes.find(n=>n.type==='SERVICE');
 const edges=[...graph.edges.map(e=>({...e,assumption:false})),...(context&&target?[{id:'client-ingress',source:'context-client',target:'context-ingress',type:'HTTPS',assumption:true},{id:'ingress-app',source:'context-ingress',target:target.id,type:'forwards · assumed',assumption:true}]:[])].filter(e=>positions.has(e.source)&&positions.has(e.target));
 return <div className="view"><Title label="SYSTEM ARCHITECTURE" title="Follow the boundaries and handoffs.">Solid components have verified repository files. Dashed components illustrate surrounding infrastructure. Cloud-specific networking is unverified.</Title><div className="diagram-tools"><label>Layer <select aria-label="Architecture layer" value={layer} onChange={e=>setLayer(e.target.value)}><option value="all">Code + deployment</option><option value="code">Application code</option><option value="deployment">Deployment example</option></select></label><label><input type="checkbox" checked={context} onChange={e=>setContext(e.target.checked)}/> Show surrounding architecture assumptions</label><div><button onClick={()=>setZoom(z=>Math.max(.5,z-.15))} aria-label="Zoom out">−</button><button onClick={()=>setZoom(1)} aria-label="Reset zoom">{Math.round(zoom*100)}%</button><button onClick={()=>setZoom(z=>Math.min(2,z+.15))} aria-label="Zoom in">+</button></div></div><div className="diagram-scroll" tabIndex={0} aria-label="Scrollable architecture diagram"><svg role="group" aria-label={`${graph.repository.name} system architecture with labeled relationships`} width={1160*zoom} height={height*zoom} viewBox={`0 0 1160 ${height}`}><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>{zones.map((z,i)=><g key={z.id}><rect x={i*290+8} y={10} width="274" height={height-24} rx="10" className="zone-bg"/><text x={i*290+24} y="42" className="zone-title">{z.title}</text><text x={i*290+24} y="63" className="zone-subtitle">{z.subtitle}</text></g>)}{edges.map((e,i)=>{const from=positions.get(e.source),to=positions.get(e.target);if(!from||!to)return null;const same=from.x===to.x;const x1=from.x+(same?114:to.x>from.x?234:0),y1=from.y+(same?116:58),x2=to.x+(same?114:to.x>from.x?0:234),y2=to.y+(same?0:58);const bend=same?`M${x1},${y1} L${x2},${y2}`:`M${x1},${y1} C${x1+(x2-x1)/2},${y1} ${x1+(x2-x1)/2},${y2} ${x2},${y2}`;return <g key={e.id} className={e.assumption?'assumed-edge':'repo-edge'}><path d={bend} markerEnd="url(#arrow)"/><text x={same?x1+6:(x1+x2)/2} y={same?(y1+y2)/2:(y1+y2)/2-8-(i%2)*12} textAnchor={same?'start':'middle'}>{e.type.replaceAll('_',' ').toLowerCase()}</text></g>;})}{nodes.map(n=>{const p=positions.get(n.id)!;return <g role="button" tabIndex={0} aria-label={`${n.label}, ${n.basis==='assumption'?'assumption':'repository component'}`} onClick={()=>onNode(n)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onNode(n);}}} key={n.id} transform={`translate(${p.x},${p.y})`} className={`diagram-node ${n.basis==='assumption'?'assumed-node':''} ${selectedId===n.id?'selected':''}`}><rect width="234" height="116" rx="7"/><text x="14" y="22" className="node-category">{n.basis==='assumption'?'ASSUMPTION':(n.detail.includes('Optional profile:')?'OPTIONAL CONFIGURATION':typeName(n).toUpperCase())}</text><text x="14" y="48" className="node-label">{n.label.length>28?n.label.slice(0,26)+'…':n.label}</text><text x="14" y="72" className="node-description">{depth==='orientation'?'Click for sources and role':n.detail.slice(0,33)}</text><text x="14" y="94" className="node-description">{depth==='inspect'?(n.evidence[0]?.path.split('/').pop()??'No repository evidence'):n.basis==='assumption'?'Reference deployment only':'Pinned repository source ↗'}</text></g>;})}</svg></div><section className="analysis-note"><strong>Deployment context</strong><p>Application and data boundaries here are logical. A VPC, subnets, load balancers, replicas, availability zones, and managed database instances depend on the installation. They are not inferred from application code.</p></section><details className="relationship-list"><summary>Read the {edges.length} connections as text</summary><ul>{edges.map(e=><li key={e.id}>{nodes.find(n=>n.id===e.source)?.label} → {e.type.replaceAll('_',' ').toLowerCase()} → {nodes.find(n=>n.id===e.target)?.label}{e.assumption?' (assumption)':' (curated interpretation)'}</li>)}</ul></details></div>;
}

function Evolution({graph,depth}:{graph:RepositoryGraph;depth:Depth}) {
 const [lens,setLens]=useState<'product'|'git'>('product');
 const groups=Array.from(new Set(graph.evolution.map(e=>e.group)));
 return <div className="view"><Title label="PROJECT EVOLUTION" title="What changed, and why it matters.">A saved sample of merged pull requests. Dates show merges; release and rollout dates are not established.</Title><div className="cap-tabs"><button aria-pressed={lens==='product'} className={lens==='product'?'active':''} onClick={()=>setLens('product')}>Product view · feature themes</button><button aria-pressed={lens==='git'} className={lens==='git'?'active':''} onClick={()=>setLens('git')}>Git view · individual PRs</button></div><p className="muted">{graph.evolution.length} merged PRs in this sample. Feature groupings and value summaries are interpretations of PR titles; the linked PR is the source of truth.</p>{lens==='product'?<div className="product-timeline">{groups.map(group=>{const events=graph.evolution.filter(e=>e.group===group);return <article className="theme-card" key={group}><span className="eyebrow">FEATURE THEME · INFERRED GROUPING</span><h3>{group}</h3><p>{events.length} PR{events.length===1?'':'s'} · {date(events.at(-1)!.date)} – {date(events[0].date)}</p>{events.map(e=><div className="product-event" key={e.commitSha}><time dateTime={e.date}>{date(e.date)}</time><div><a href={e.prUrl} target="_blank" rel="noreferrer">#{e.prNumber} · {e.prTitle} ↗</a><p>{e.value}</p><a className="file-count" href={`${e.prUrl}/files`} target="_blank" rel="noreferrer">{e.files} files changed ↗</a><span className="rollout">Merged · rollout unverified</span></div></div>)}</article>;})}</div>:<div className="pr-list">{graph.evolution.map(e=><article className="pr-card" key={e.commitSha}><div className="pr-meta"><span>MERGED {date(e.date)}</span><a href={e.prUrl} target="_blank" rel="noreferrer">PR #{e.prNumber} ↗</a></div><h3>{e.prTitle}</h3><p>{e.value}</p><div className="change-stats"><a href={`${e.prUrl}/files`} target="_blank" rel="noreferrer">{e.files} files changed ↗</a><span>+{e.additions} / −{e.deletions}</span><a href={`${graph.repository.url}/commit/${e.commitSha}`} target="_blank" rel="noreferrer">Commit {e.commitSha.slice(0,7)} ↗</a></div><details open={depth==='inspect'}><summary>Changed files & author’s description</summary><p className="pr-description">{e.detail}</p><ul>{e.paths?.map(path=><li key={path}><a href={fileUrl(graph,path,e.commitSha)} target="_blank" rel="noreferrer"><code>{path}</code></a></li>)}</ul>{e.files>(e.paths?.length??0)&&<p>Showing the first {e.paths?.length} files; the PR has the complete diff.</p>}</details></article>)}</div>}</div>;
}
function Sources({graph,onNode}:{graph:RepositoryGraph;onNode:(n:GraphNode)=>void}) {
 return <div className="view"><Title label="SOURCES & LIMITS" title="See what supports the explanation.">Original files, deployment examples, and pull requests behind this demo. Product interpretations are labeled so you can judge their support.</Title><section className="analysis-note"><strong>What was checked</strong><p>Each linked path exists in the pinned GitHub file tree. PR dates, counts, and commit IDs come from GitHub’s public API. Component roles and feature groupings are curated interpretations, and runtime behavior remains unverified.</p></section><div className="sources-list">{graph.nodes.map(node=><button key={node.id} onClick={()=>onNode(node)}><span>{node.label}</span><small>{node.evidence.length} verified source location{node.evidence.length===1?'':'s'} →</small></button>)}</div><h3>Known limitations</h3><ul className="limits">{graph.repository.limitations.map(limit=><li key={limit}>{limit}</li>)}</ul></div>;
}
