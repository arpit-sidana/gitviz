import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReferenceArchitecture } from '../lib/reference-architecture.ts';
import { routeConnections } from '../lib/orthogonal-routing.ts';

const demos=JSON.parse(await readFile(new URL('../lib/snapshots/demos.json',import.meta.url)));
test('AWS references consistently distinguish proposals from source evidence',()=>{
 for(const graph of demos) {
  const model=buildReferenceArchitecture(graph);
  const ids=new Set(model.resources.map(n=>n.id));
  assert.equal(ids.size,model.resources.length);
  assert.equal(model.boundaries.filter(b=>b.kind==='az').length,2);
  assert.equal(model.boundaries.filter(b=>['public','private','data'].includes(b.kind)).length,6);
  for(const r of model.resources) {assert.equal(r.basis,'assumption');assert.ok(r.references.every(link=>link.url.startsWith('https://docs.aws.amazon.com/')));for(const e of r.evidence) assert.equal(e.commitSha,graph.repository.commitSha);}
  for(const e of model.connections) assert.ok(ids.has(e.source)&&ids.has(e.target));
  assert.ok(!model.connections.some(e=>e.traffic==='request'&&e.target.startsWith('db-')),'no direct internet request to database');
  assert.ok(!model.connections.some(e=>e.id.startsWith('sql-')&&e.target==='db-b'),'no reads to RDS standby');
  for(const zone of ['a','b']) assert.ok(model.connections.some(e=>e.source===`routes-${zone}`&&e.target===`nat-${zone}`),'same-AZ NAT route');
  assert.ok(model.routes.filter(r=>r.table.startsWith('Isolated')).every(r=>r.destination!=='0.0.0.0/0'));
 }
});
test('orthogonal routes resolve every connection and do not cross resource bodies',()=>{
 for(const graph of demos) {
  const model=buildReferenceArchitecture(graph),routes=routeConnections(model.resources,model.connections);
  assert.equal(routes.size,model.connections.length);
  for(const edge of model.connections) {
   const points=routes.get(edge.id).points;
   for(let i=1;i<points.length;i++) {
    const a=points[i-1],b=points[i];assert.ok(a.x===b.x||a.y===b.y,`${edge.id} is orthogonal`);
    for(const box of model.resources.filter(n=>n.id!==edge.source&&n.id!==edge.target)) {
     const inside=a.x===b.x?a.x>box.x&&a.x<box.x+235&&Math.max(a.y,b.y)>box.y&&Math.min(a.y,b.y)<box.y+98:a.y>box.y&&a.y<box.y+98&&Math.max(a.x,b.x)>box.x&&Math.min(a.x,b.x)<box.x+235;
     assert.ok(!inside,`${edge.id} crosses ${box.id}`);
    }
   }
  }
 }
});
test('runtime facts preserve configuration instead of inventing cloud network semantics',()=>{
 const dify=demos.find(d=>d.repository.name==='dify');
 assert.ok(dify.runtime.services.find(s=>s.name==='api').networks.includes('ssrf_proxy_network'));
 assert.ok(dify.runtime.services.find(s=>s.name==='qdrant').profiles.includes('qdrant'));
 const cal=demos.find(d=>d.repository.name.startsWith('cal.'));
 assert.ok(cal.runtime.services.find(s=>s.name==='calcom').ports.includes('3000:3000'));
 assert.equal(demos.find(d=>d.repository.name==='saleor').runtime,undefined);
});
