'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Depth, GraphNode, RepositoryGraph } from '../lib/graph';
import { buildReferenceArchitecture, referenceLinks } from '../lib/reference-architecture';
import { routeConnections } from '../lib/orthogonal-routing';
import type { Connection, Resource, Traffic } from '../lib/reference-architecture';

const trafficOptions: {id:Traffic;label:string;explanation:string}[] = [
  {id:'request',label:'Request path',explanation:'DNS resolution, WAF association, public ingress, load balancer and private API targets.'},
  {id:'data',label:'Jobs & data',explanation:'API and worker access to the relational writer, cache/broker and optional vector backend. Replication is shown separately.'},
  {id:'egress',label:'Outbound routing',explanation:'Private task → app route table → same-AZ NAT → internet gateway → external provider.'},
  {id:'operations',label:'Storage & operations',explanation:'S3 endpoint access, secret delivery, image pulls, logs and metrics. IAM policies and endpoint choices are proposed.'},
  {id:'all',label:'All connections',explanation:'Complete reference topology. Select a resource to emphasize its immediate connections.'},
];
const resourceWidth=235, resourceHeight=98;

function ResourceIcon({kind}:{kind:Resource['icon']}) {
  if(kind==='database'||kind==='storage') return <><ellipse cx="15" cy="6" rx="12" ry="5"/><path d="M3 6v18c0 7 24 7 24 0V6M3 15c0 7 24 7 24 0M3 23c0 7 24 7 24 0"/></>;
  if(kind==='security') return <><path d="M15 2L27 7v10c0 8-12 13-12 13S3 25 3 17V7z"/><path d="M9 15l4 4 8-9"/></>;
  if(kind==='queue') return <><rect x="2" y="4" width="26" height="24" rx="3"/><path d="M8 10h14M8 16h14M8 22h14"/></>;
  if(kind==='network') return <><rect x="3" y="8" width="24" height="14" rx="3"/><path d="M15 1v7M15 22v8M0 15h6M24 15h6M11 1h8M11 30h8"/></>;
  if(kind==='observe') return <><path d="M3 3v25h26M7 21l6-9 6 5 8-12"/><circle cx="13" cy="12" r="2"/></>;
  return <><rect x="2" y="3" width="26" height="21" rx="3"/><path d="M9 30h12M15 24v6M7 9h7M7 14h14"/></>;
}

export function ArchitectureExplorer({graph,onNode,onClear,selectedId,depth,application}:{graph:RepositoryGraph;onNode:(n:GraphNode)=>void;onClear:()=>void;selectedId?:string;depth:Depth;application:ReactNode}) {
  const [view,setView]=useState<'network'|'application'|'runtime'>('network');
  return <div className="architecture-explorer">
    <div className="architecture-switch" aria-label="Architecture views">{([{id:'network',label:'AWS deployment & network'},{id:'application',label:'Repository components'},{id:'runtime',label:'Runtime configuration'}] as const).map(item=><button key={item.id} aria-pressed={view===item.id} className={view===item.id?'active':''} onClick={()=>{setView(item.id);onClear();}}>{item.label}</button>)}</div>
    {view==='application'?application:view==='runtime'?<RuntimeInventory graph={graph} onNode={onNode}/>:<NetworkArchitecture graph={graph} onNode={onNode} selectedId={selectedId} depth={depth}/>}
  </div>;
}

function NetworkArchitecture({graph,onNode,selectedId,depth}:{graph:RepositoryGraph;onNode:(n:GraphNode)=>void;selectedId?:string;depth:Depth}) {
  const model=useMemo(()=>buildReferenceArchitecture(graph),[graph]);
  const routes=useMemo(()=>routeConnections(model.resources,model.connections),[model]);
  const [traffic,setTraffic]=useState<Traffic>('request');
  const [zoom,setZoom]=useState(1);
  const [fit,setFit]=useState(true);
  const [available,setAvailable]=useState(1400);
  const viewport=useRef<HTMLDivElement>(null);
  useEffect(()=>{const el=viewport.current;if(!el)return;const observer=new ResizeObserver(entries=>setAvailable(entries[0].contentRect.width));observer.observe(el);return()=>observer.disconnect();},[]);
  const scale=fit?Math.min(1,available/1680):zoom;
  const connections=model.connections.filter(e=>traffic==='all'||e.traffic===traffic);
  const focused=model.resources.find(r=>r.id===selectedId);
  const selectConnection=(edge:Connection)=>onNode({id:edge.id,type:'SERVICE',label:`${model.resources.find(r=>r.id===edge.source)?.label} → ${model.resources.find(r=>r.id===edge.target)?.label}`,detail:edge.detail,basis:'assumption',evidence:[],architectureDetails:[{label:'Protocol / port',value:edge.protocol,basis:'proposal'},{label:'Boundary policy',value:edge.security,basis:'proposal'},{label:'Traffic class',value:edge.traffic,basis:'proposal'}],references:referenceLinks});
  return <div className="network-view">
    <div className="view-title"><p>DEPLOYMENT & NETWORK DESIGN</p><h2>From the public edge to private data.</h2><div>A repository-adapted AWS reference architecture for {graph.repository.name}. Explore routing, service boundaries, storage, failover and operational dependencies.</div></div>
    <div className="reference-banner"><strong>PROPOSED AWS DESIGN</strong><span>AWS resources, CIDRs, ports and policies below are design assumptions. Repository runtime facts are linked in component details. This does not describe a discovered production installation.</span></div>
    <div className="traffic-tabs" aria-label="Architecture traffic layers">{trafficOptions.map(option=><button key={option.id} className={traffic===option.id?'active':''} aria-pressed={traffic===option.id} onClick={()=>setTraffic(option.id)}>{option.label}</button>)}</div>
    <div className="network-toolbar"><p>{trafficOptions.find(t=>t.id===traffic)?.explanation}</p><div><button aria-pressed={fit} onClick={()=>setFit(true)}>Fit width</button><button aria-label="Zoom network diagram out" onClick={()=>{setZoom(Math.max(.4,scale-.15));setFit(false);}}>−</button><button onClick={()=>{setFit(false);setZoom(1);}}>{Math.round(scale*100)}%</button><button aria-label="Zoom network diagram in" onClick={()=>{setZoom(Math.min(2,scale+.15));setFit(false);}}>+</button></div></div>
    <div className="network-key"><span className="key-compute">Compute</span><span className="key-network">Routing & connectivity</span><span className="key-data">Data</span><span className="key-security">Security</span><span>Click a resource or a connection for details</span></div>
    <div className="network-viewport" ref={viewport} tabIndex={0} aria-label="Scrollable AWS reference architecture"><svg width={1680*scale} height={1460*scale} viewBox="0 0 1680 1460" role="group" aria-label={`${graph.repository.name} proposed AWS architecture, two availability zones and three subnet tiers`}>
      <defs><marker id="network-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>
      {model.boundaries.map(b=><g key={b.id} className={`network-boundary boundary-${b.kind}`}><rect x={b.x} y={b.y} width={b.width} height={b.height} rx="5"/><text x={b.x+16} y={b.y+26} className="boundary-label">{b.label}</text><text x={b.x+16} y={b.y+45} className="boundary-detail">{b.detail}</text></g>)}
      {connections.map(edge=>{const p=routes.get(edge.id)!;const active=!focused||edge.source===selectedId||edge.target===selectedId;return <g key={edge.id} role="button" tabIndex={0} aria-label={`${edge.label}, ${edge.protocol}`} className={`network-connection traffic-${edge.traffic} ${active?'':'dimmed'} ${selectedId===edge.id?'selected':''}`} onClick={()=>selectConnection(edge)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectConnection(edge);}}}><title>{edge.label}: {edge.protocol}. {edge.detail}</title><path className="connection-hit" d={p.path}/><path d={p.path} className="connection-line" markerEnd="url(#network-arrow)"/><text x={p.lx} y={p.ly} className="connection-label">{edge.protocol}</text></g>;})}
      {model.resources.map(resource=>{
        const lines=wrap(resource.label,21);
        return <g key={resource.id} transform={`translate(${resource.x},${resource.y})`} role="button" tabIndex={0} aria-label={`${resource.label}, proposed architecture`} onClick={()=>onNode(resource)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onNode(resource);}}} className={`network-resource icon-${resource.icon} ${selectedId===resource.id?'selected':''}`}>
          <title>{resource.label}. {resource.detail}</title>
          <rect className="resource-card" width={resourceWidth} height={resourceHeight} rx="5"/>
          <rect className="resource-stripe" width="4" height={resourceHeight} rx="2"/>
          <g transform="translate(12 12)" className="resource-symbol"><ResourceIcon kind={resource.icon}/></g>
          <text x="52" y="25" className="resource-title">{lines.slice(0,2).map((line,i)=><tspan x="52" dy={i?18:0} key={i}>{line}</tspan>)}</text>
          <text x="13" y="65" className="resource-subtitle">{resource.subtitle.length>38?resource.subtitle.slice(0,36)+'…':resource.subtitle}</text>
          <text x="13" y="85" className="resource-badge">{depth==='inspect'&&resource.evidence.length?resource.evidence[0].path.split('/').pop():resource.badge}</text>
        </g>;
      })}
    </svg></div>
    <p className="network-footnote">Both ALB nodes represent one load balancer. The RDS standby is for failover, not read traffic. Dashed lines show operations or policy associations; route tables are not application proxies.</p>
    <section className="traffic-register"><h3>{trafficOptions.find(t=>t.id===traffic)?.label} · connection register</h3><p>Inspect the protocol, direction and boundary policy behind each arrow.</p><div className="table-scroll"><table><thead><tr><th>Connection</th><th>Protocol / port · proposed</th><th>Security / routing policy · proposed</th></tr></thead><tbody>{connections.map(e=><tr key={e.id}><td><button onClick={()=>selectConnection(e)}>{model.resources.find(r=>r.id===e.source)?.label} → {model.resources.find(r=>r.id===e.target)?.label}</button><small>{e.label}</small></td><td>{e.protocol}</td><td>{e.security}</td></tr>)}</tbody></table></div></section>
    <details className="route-register"><summary>Route tables and network reachability</summary><div className="table-scroll"><table><thead><tr><th>Route table</th><th>Destination</th><th>Target</th><th>Purpose</th></tr></thead><tbody>{model.routes.map((r,i)=><tr key={i}><td>{r.table}</td><td><code>{r.destination}</code></td><td>{r.target}</td><td>{r.reason}</td></tr>)}</tbody></table></div></details>
    <div className="architecture-decisions">{model.decisions.map(d=><article key={d.title}><h3>{d.title}</h3><p>{d.detail}</p></article>)}</div>
    <div className="architecture-reading"><strong>Design references</strong>{referenceLinks.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
  </div>;
}

function wrap(label:string,max:number) {const lines:string[]=[];let line='';for(const word of label.split(' ')){if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);return lines;}

function RuntimeInventory({graph,onNode}:{graph:RepositoryGraph;onNode:(n:GraphNode)=>void}) {
  const services=graph.runtime?.services??[];
  return <div className="runtime-inventory"><div className="view-title"><p>REPOSITORY DEPLOYMENT FACTS</p><h2>What is actually declared.</h2><div>Parsed from the pinned Compose file. Docker networks and host-port mappings do not establish AWS subnets, security groups, or production topology.</div></div>{!services.length?<div className="analysis-note">No deployment manifest was ingested for this snapshot. Repository components are supported by code files; the AWS view is a deployment proposal.</div>:<div className="table-scroll"><table><thead><tr><th>Service / image</th><th>Published ports</th><th>Networks</th><th>Dependencies</th><th>Health check</th></tr></thead><tbody>{services.map(s=><tr key={s.name}><td><button onClick={()=>{const node=graph.nodes.find(n=>n.id===`compose-${s.name}`);if(node)onNode({...node,architectureDetails:[{label:'Image',value:s.image??'Built locally',basis:'repository'},{label:'Ports',value:s.ports.join(', ')||'Not published',basis:'repository'},{label:'Mounts',value:s.volumes.join('; ')||'None declared',basis:'repository'},{label:'Optional profiles',value:s.profiles.join(', ')||'Default service',basis:'repository'}]});}}>{s.name} ↗</button><small>{s.image??'Local build'}</small></td><td>{s.ports.join(', ')||'None published'}</td><td>{s.networks.join(', ')||'Implicit default'}</td><td>{s.dependencies.join(', ')||'None declared'}</td><td>{s.healthcheck?'Declared':'Not declared'}</td></tr>)}</tbody></table></div>}</div>;
}
