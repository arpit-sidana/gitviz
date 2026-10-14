// Build-time only. No credentials or live API access are shipped to visitors.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { addComposeServices } from './compose-graph.mjs';
import { demos } from '../lib/demo-data.ts';
if(process.argv.includes('--deployment-only')) {
 const saved=JSON.parse(await readFile('lib/snapshots/demos.json','utf8'));
 for(const graph of saved) {
   const e=graph.nodes.find(n=>n.id==='deployment')?.evidence[0];
   if(!e) continue;
   const response=await fetch(`https://raw.githubusercontent.com/${graph.repository.owner}/${graph.repository.name}/${e.commitSha}/${e.path}`);
   if(!response.ok) throw new Error(`Deployment source fetch failed: ${response.status}`);
   addComposeServices(graph,await response.text(),e);
   console.log(`${graph.repository.name}: ${graph.nodes.length} components including deployment services`);
 }
 await writeFile('lib/snapshots/demos.json',JSON.stringify(saved,null,2)+'\n');
 process.exit(0);
}
const headers = { 'User-Agent': 'gitviz-demo-curation', Accept: 'application/vnd.github+json' };
async function api(path) {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}
const alternatives = {
 'booking-page': /apps\/web\/app\/.*\[type\]\/page\.tsx$/,
 'booking-api': /bookings.*controller\.ts$/,
 'booking-service': /handleNewBooking\/createBooking\.ts$/,
 'booking-db': /schema\.prisma$/,
 'calendar': /CalendarManager\.ts$/,
 'availability-ui': /availability.*page\.tsx$/,
 'availability-api': /^packages\/features\/schedules\/lib\/slots\.ts$/,
 'availability-db': /schema\.prisma$/,
 'payment-service': /stripepayment\/lib\/PaymentService\.ts$/,
 'stripe': /stripepayment.*PaymentService\.ts$/,
 'workflow-engine': /^api\/core\/workflow\/workflow_entry\.py$/,
 'dataset-ui': /datasets\/page\.tsx$/,
 'vector-store': /vector_factory\.py$/,
 'run-ui': /workflow\/run\/.*index\.tsx$/,
 'graphql': /^saleor\/graphql\/schema\.graphql$/,
};
const result = [];
for (const seed of demos) {
 const graph = structuredClone(seed);
 const repo = `${graph.repository.owner}/${graph.repository.name}`;
 const meta = await api(`repos/${repo}`);
 graph.repository.owner=meta.owner.login;
 graph.repository.name=meta.name;
 graph.repository.url=meta.html_url;
 const commit = await api(`repos/${repo}/commits/${meta.default_branch}`);
 const tree = await api(`repos/${repo}/git/trees/${commit.sha}?recursive=1`);
 if (tree.truncated) throw new Error(`Truncated source tree: ${repo}`);
 const paths = new Set(tree.tree.filter(x=>x.type==='blob').map(x=>x.path));
 graph.repository.commitSha = commit.sha;
 graph.repository.defaultBranch = meta.default_branch;
 graph.repository.snapshotDate = new Date().toISOString();
 graph.repository.analyzedAt = commit.commit.committer.date;
 graph.repository.limitations = ['Curated product interpretation; source paths verified against the pinned repository tree. Relationships are interpretations, not a complete call graph.', 'Recent merged PR sample only. Merge dates do not prove deployment or customer availability.', 'No live repository ingestion or runtime tracing. Dashed infrastructure nodes are explicit assumptions.'];
 for (const node of graph.nodes) {
   node.basis='repository';
   node.evidence = node.evidence.flatMap(e => {
     const path = paths.has(e.path) ? e.path : [...paths].find(p=>alternatives[node.id]?.test(p));
     return path ? [{ path, note:'Verified source location; component role is a curated interpretation.', commitSha:commit.sha }] : [];
   });
 }
 graph.nodes=graph.nodes.filter(n=>n.evidence.length);
 if(repo==='langgenius/dify') { const engine=graph.nodes.find(n=>n.id==='workflow-engine'); if(engine) {engine.label='Workflow execution';engine.detail='Workflow entry coordinates execution and hands work to the workflow runtime.';} }
 if(repo==='calcom/cal.com') { const service=graph.nodes.find(n=>n.id==='booking-service'); if(service) {service.label='Create booking';service.detail='Booking creation implementation, selected from the booking orchestration module.';} }
 const valid = new Set(graph.nodes.map(n=>n.id));
 graph.capabilities.forEach(c=>c.nodeIds=c.nodeIds.filter(id=>valid.has(id)));
 graph.edges=graph.edges.filter(e=>valid.has(e.source)&&valid.has(e.target)).map(e=>({...e,evidence:graph.nodes.find(n=>n.id===e.source).evidence}));
 graph.evaluations=[]; // No scored evaluation is claimed by curated demonstrations.
 const deploymentPath=['docker/docker-compose.yaml','docker-compose.yml','docker-compose.yaml'].find(p=>paths.has(p));
 if (deploymentPath) {
   graph.nodes.push({id:'deployment',type:'SERVICE',label:'Deployment configuration',detail:'Repository deployment example. This does not establish how any production installation is hosted.',basis:'repository',evidence:[{path:deploymentPath,commitSha:commit.sha,note:'Repository-provided deployment configuration.'}]});
   const firstService=graph.nodes.find(n=>n.type==='SERVICE'&&n.id!=='deployment');
   if(firstService) graph.edges.push({id:'deployment-edge',source:'deployment',target:firstService.id,type:'DEPENDS_ON',evidence:graph.nodes.at(-1).evidence});
   const response=await fetch(`https://raw.githubusercontent.com/${graph.repository.owner}/${graph.repository.name}/${commit.sha}/${deploymentPath}`);
   if(!response.ok) throw new Error(`Missing deployment source: ${repo}`);
   addComposeServices(graph,await response.text(),{path:deploymentPath,commitSha:commit.sha});
 }
 const pulls = await api(`repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=30`);
 graph.evolution=[];
 for(const pr of pulls.filter(p=>p.merged_at).slice(0,4)) {
   const detail=await api(`repos/${repo}/pulls/${pr.number}`);
   const files=await api(`repos/${repo}/pulls/${pr.number}/files?per_page=100`);
   const lower=pr.title.toLowerCase();
   const cap=graph.capabilities.find(c=>c.name.toLowerCase().split(/\W+/).some(w=>w.length>4&&lower.includes(w)));
   const group=cap?.name ?? (/fix|bug/.test(lower)?'Reliability':/docs|document/.test(lower)?'Developer documentation':/test/.test(lower)?'Quality & testing':'Platform improvements');
   graph.evolution.push({date:pr.merged_at,title:pr.title,detail:detail.body?.replace(/<[^>]*>/g,'').slice(0,700)||'Open the pull request for the author’s description.',capabilityId:cap?.id??graph.capabilities[0].id,files:detail.changed_files,commitSha:pr.merge_commit_sha,prUrl:pr.html_url,prNumber:pr.number,prTitle:pr.title,group,value:`${group}: ${pr.title.replace(/^(fix|feat|chore|refactor|docs)(\([^)]*\))?:\s*/i,'')}. This is a title-based summary; inspect the PR for scope and rollout.`,additions:detail.additions,deletions:detail.deletions,paths:files.slice(0,12).map(f=>f.filename)});
 }
 graph.evolution.sort((a,b)=>b.date.localeCompare(a.date));
 const summaries={
   18935:['Booking experience','Guests receive a clear message when a selected time slot is no longer available, helping them recover and choose another time.'],
   19894:['Developer experience','Restores local HTTP server startup by correcting which development dependencies are required.'],
   19911:['Catalog availability','Lets merchants control whether a product variant is available in each sales channel. This PR references #19795; both entries may represent related work rather than separate launches.'],
   19795:['Catalog availability','Adds per-channel availability controls for product variants, so merchants can manage channel-specific assortments.'],
   19902:['Catalog localization','Allows category and collection descriptions to be translated for different storefront languages.'],
   44005:['Workflow output reliability','Selects the intended structured model output instead of mistaking JSON inside reasoning text for the answer.'],
   44039:['Knowledge integrations','Fixes datasource credential comparisons on MySQL by treating credentials as JSON.'],
   44066:['Tool interoperability','Accepts an additional MCP protocol version so compatible tool connections are not rejected by version validation.'],
   44120:['SDK upload correctness','Ensures reused upload forms use the current user rather than retaining a previous user field.'],
 };
 for(const e of graph.evolution) { if(summaries[e.prNumber]) {e.group=summaries[e.prNumber][0];e.value=summaries[e.prNumber][1];} }
 result.push(graph);
 console.log(`${repo}: ${graph.nodes.length} verified components, ${graph.evolution.length} merged PRs`);
}
await mkdir('lib/snapshots',{recursive:true});
await writeFile('lib/snapshots/demos.json', JSON.stringify(result,null,2)+'\n');
