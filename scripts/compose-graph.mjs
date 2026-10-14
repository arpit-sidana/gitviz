import { load } from 'js-yaml';

export function addComposeServices(graph, source, evidence) {
 const compose=load(source);
 const included=new Set(['web','api','worker','worker_beat','redis','nginx','db','db_postgres','db_mysql','sandbox','ssrf_proxy','plugin_daemon','weaviate','qdrant','calcom','database','postgres']);
 const services=Object.entries(compose.services??{}).filter(([name])=>included.has(name));
 // Persist an explicit allowlist of runtime metadata, never environment values.
 graph.runtime={services:services.map(([name,config])=>({
   name,
   image:typeof config.image==='string'?config.image:undefined,
   ports:(config.ports??[]).map(p=>typeof p==='string'||typeof p==='number'?String(p):`${p.host_ip?p.host_ip+':':''}${p.published??''}:${p.target??''}/${p.protocol??'tcp'}`),
   networks:Array.isArray(config.networks)?config.networks:Object.keys(config.networks??{}),
   volumes:(config.volumes??[]).map(v=>typeof v==='string'?v:[v.source,v.target,v.read_only?'ro':undefined].filter(Boolean).join(':')),
   profiles:config.profiles??[],
   dependencies:Array.isArray(config.depends_on)?config.depends_on:Object.keys(config.depends_on??{}),
   healthcheck:Boolean(config.healthcheck),
   evidence,
 })),networks:Object.keys(compose.networks??{})};
 graph.nodes=graph.nodes.filter(n=>!n.id.startsWith('compose-'));
 graph.edges=graph.edges.filter(e=>!e.id.startsWith('compose-'));
 for(const [name,config] of services) {
   const storage=/^(db|database|postgres|redis|weaviate|qdrant)/.test(name);
   graph.nodes.push({id:`compose-${name}`,type:storage?'DATA_STORE':name.includes('worker')?'JOB':'SERVICE',label:`${name} · container`,detail:`Service declared in ${evidence.path}.${config.profiles?.length?' Optional profile: '+config.profiles.join(',')+'.':''} Repository deployment example, not a verified production instance.`,basis:'repository',zone:storage?'data':'application',evidence:[{...evidence,note:`Parsed services.${name} from the repository’s Compose configuration.`}]});
 }
 const serviceNames=new Set(services.map(([name])=>name));
 for(const [name,config] of services) {
   const deps=Array.isArray(config.depends_on)?config.depends_on:Object.keys(config.depends_on??{});
   for(const dep of deps.filter(d=>serviceNames.has(d))) graph.edges.push({id:`compose-${name}-${dep}`,source:`compose-${name}`,target:`compose-${dep}`,type:'DEPENDS_ON',evidence:[{...evidence,note:`Explicit depends_on from ${name} to ${dep}.`}]});
 }
}
