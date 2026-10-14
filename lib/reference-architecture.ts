import type { GraphNode, RepositoryGraph, Evidence } from './graph';

export type Traffic = 'all' | 'request' | 'data' | 'egress' | 'operations';
export type Resource = GraphNode & {
  x: number; y: number; icon: 'client' | 'network' | 'compute' | 'database' | 'queue' | 'storage' | 'security' | 'observe';
  subtitle: string; badge: string;
};
export type Connection = {
  id: string; source: string; target: string; label: string; protocol: string;
  traffic: Exclude<Traffic, 'all'>; detail: string; security: string;
};
export type Boundary = { id: string; label: string; detail: string; x: number; y: number; width: number; height: number; kind: 'region' | 'vpc' | 'az' | 'public' | 'private' | 'data' | 'managed' };
export type ReferenceArchitecture = {
  resources: Resource[]; connections: Connection[]; boundaries: Boundary[];
  routes: { table: string; destination: string; target: string; reason: string }[];
  decisions: { title: string; detail: string }[];
};

const awsNetwork = 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-example-private-subnets-nat.html';
const awsSecurity = 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security-network.html';
const awsEgress = 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/networking-outbound.html';

export function buildReferenceArchitecture(graph: RepositoryGraph): ReferenceArchitecture {
  const dify = graph.repository.name === 'dify';
  const cal = graph.repository.name.startsWith('cal.');
  const appPort = cal ? '3000' : dify ? '5001' : '8000';
  const appLabel = cal ? 'Next.js web + API' : dify ? 'Dify web + API' : 'Saleor GraphQL API';
  const appSource = dify ? 'workflow-api' : cal ? 'booking-api' : 'graphql';
  const jobSource = dify ? 'index-job' : cal ? 'calendar' : 'webhook-job';
  const storeSource = dify ? 'run-store' : cal ? 'booking-db' : 'checkout-model';
  const resources: Resource[] = [];
  const connections: Connection[] = [];
  const boundaries: Boundary[] = [
    { id:'region',label:'AWS Region · reference design',detail:'Region and account not selected',x:16,y:170,width:1648,height:1280,kind:'region' },
    { id:'vpc',label:'Amazon VPC · 10.42.0.0/16',detail:'Proposed CIDR · local routing between subnets',x:36,y:220,width:1280,height:1208,kind:'vpc' },
    { id:'managed',label:'Regional managed services',detail:'Outside the VPC address space',x:1340,y:220,width:306,height:1208,kind:'managed' },
  ];
  for (const [i, az] of ['A','B'].entries()) {
    const x = 56 + i * 636;
    boundaries.push(
      { id:`az-${az}`,label:`Availability Zone ${az}`,detail:'Failure isolation boundary · proposed',x,y:350,width:602,height:1058,kind:'az' },
      { id:`public-${az}`,label:`Public subnet ${az} · 10.42.${i}.0/24`,detail:'0.0.0.0/0 → internet gateway',x:x+16,y:408,width:570,height:180,kind:'public' },
      { id:`app-${az}`,label:`Private application subnet ${az} · 10.42.${10+i}.0/24`,detail:`No public IPs · outbound default → NAT ${az}`,x:x+16,y:620,width:570,height:338,kind:'private' },
      { id:`data-${az}`,label:`Isolated data subnet ${az} · 10.42.${20+i}.0/24`,detail:'Local routes only · no internet default route',x:x+16,y:990,width:570,height:300,kind:'data' },
    );
  }
  function add(id:string,label:string,subtitle:string,x:number,y:number,icon:Resource['icon'],detail:string,sourceIds:string[]=[],service?:string) {
    const runtime = graph.runtime?.services.find(s => s.name === service);
    const sourceEvidence = sourceIds.flatMap(key => graph.nodes.find(n => n.id === key)?.evidence ?? []);
    const evidence:Evidence[] = [...sourceEvidence, ...(runtime ? [runtime.evidence] : [])].filter((e,i,a)=>a.findIndex(p=>p.path===e.path)===i);
    const details:NonNullable<GraphNode['architectureDetails']> = [
      {label:'AWS placement',value:'Proposed reference deployment. No AWS resources were discovered.',basis:'proposal'},
    ];
    if (runtime) {
      if(runtime.image) details.push({label:'Repository container image',value:runtime.image,basis:'repository'});
      details.push({label:'Published ports in Compose',value:runtime.ports.join(', ')||'None explicitly published',basis:'repository'});
      if(runtime.networks.length) details.push({label:'Compose networks',value:runtime.networks.join(', '),basis:'repository'});
      if(runtime.volumes.length) details.push({label:'Storage mounts',value:runtime.volumes.join('; '),basis:'repository'});
      if(runtime.profiles.length) details.push({label:'Optional Compose profile',value:runtime.profiles.join(', '),basis:'repository'});
      details.push({label:'Health check declared',value:runtime.healthcheck?'Yes':'No',basis:'repository'});
    }
    resources.push({id,label,subtitle,x,y,icon,badge:runtime?'PROPOSED · REPO RUNTIME':evidence.length?'PROPOSED · REPO SOURCE':'PROPOSED',type:icon==='database'||icon==='queue'||icon==='storage'?'DATA_STORE':icon==='client'?'UI_SURFACE':'SERVICE',detail,basis:'assumption',evidence,architectureDetails:details,references:[{label:'AWS VPC reference topology',url:awsNetwork},{label:'AWS ECS network boundaries',url:awsSecurity}]});
  }
  function link(id:string,source:string,target:string,label:string,protocol:string,traffic:Connection['traffic'],detail:string,security:string) { connections.push({id,source,target,label,protocol,traffic,detail,security}); }
  add('client','Browser / API consumer','Public internet',48,40,'client','End user or storefront sends requests to a public application hostname. Saleor’s storefront is a separate deployment.');
  add('dns','Route 53 · DNS','Alias → public ALB',320,40,'network','Proposed DNS alias for the load balancer. DNS resolves the address; it is not an application traffic proxy.');
  add('waf','AWS WAF · attached to ALB','HTTP filtering / rate rules',600,40,'security','Proposed web ACL attached to the regional ALB. It is drawn separately for policy visibility, not as a standalone network hop.');
  add('provider',dify?'Model / tool providers':cal?'Calendars / payments':'Payment / app webhooks','External provider boundary',1390,40,'network','External APIs remain outside the VPC. Domain allowlists, credentials, request limits, retries, and data sent to providers require review.',[dify?'model-provider':cal?'calendar':'payment-plugin']);
  add('igw','Internet gateway','Public subnet internet route',500,265,'network','Proposed VPC internet gateway. Public ALB nodes and public NAT gateways use this route. Private tasks do not receive public IPs.');
  for(const [i,az] of ['a','b'].entries()) {
    const left=95+i*636, right=365+i*636, upper=az.toUpperCase();
    add(`alb-${az}`,`ALB node · AZ ${upper}`,'One shared ALB · TLS :443',left,466,'network','Proposed node of one Application Load Balancer spanning both public subnets. HTTPS terminates here; target groups route to private tasks. Health checks gate traffic.');
    add(`nat-${az}`,`NAT gateway · AZ ${upper}`,'Outbound only · zonal route',right,466,'network',`Proposed zonal NAT gateway. App subnet ${upper} uses its same-AZ NAT for outbound IPv4 requests. It does not accept unsolicited inbound connections.`,[]);
    add(`api-${az}`,appLabel,`ECS service · private target :${appPort}`,left,682,'compute',`Proposed ECS/Fargate tasks in AZ ${upper}. ${dify?'Web and API use distinct services/target groups; 5001 is the API target and 3000 is the web target.':cal?'The Next.js container serves web and API routes.':'The ASGI/GraphQL API is reached by a separately hosted storefront.'} Target ports, TLS policy, task count, health endpoint and scaling are design choices to validate.`,[appSource],cal?'calcom':dify?'api':undefined);
    add(`job-${az}`,cal?'Integration execution':'Background workers',cal?'Calendar / payment adapters':'Async consumers · no public listener',right,682,'compute',cal?'Proposed app-side execution for calendar/payment work. This does not assert that Cal.diy has a separately deployed worker. Confirm the runtime boundary before separating tasks.':`Proposed private worker service in AZ ${upper}. ${dify?'Indexing jobs share the API image in the Compose example.':'Webhook work is represented in the repository; the worker fleet and broker topology are a deployment proposal.'} Consumer semantics, retry policy, concurrency and poison-message handling need review.`,[jobSource],dify?'worker':undefined);
    add(`routes-${az}`,`App route table · ${upper}`,`0.0.0.0/0 → NAT ${upper}`,left,834,'network','Proposed private-subnet routing: VPC CIDR → local; S3 prefix list → gateway endpoint; default IPv4 → same-AZ NAT. NAT routes provide connectivity, not destination-level filtering.');
    add(`isolation-${az}`,dify?'Sandbox / plugin boundary':'Task identity & egress',dify?'Separate security group / task':'Least-privilege IAM role',right,834,dify?'compute':'security',dify?'Repository includes sandbox, plugin daemon and SSRF proxy services. Proposed deployment isolates untrusted tool execution from app/data security groups; allowlisted egress needs an explicit proxy/firewall policy.':'Proposed task IAM role with narrow storage and secret access. Restrict service-to-service connections with security groups. Egress destinations need a separate policy; security groups alone do not filter hostnames.',dify?['compose-sandbox','compose-plugin_daemon','compose-ssrf_proxy']:[],dify?'sandbox':undefined);
    add(`db-${az}`,i===0?'RDS PostgreSQL · writer':'RDS PostgreSQL · standby',i===0?'SQL :5432 · app/worker SG only':'Multi-AZ failover · not read traffic',left,1052,'database',`Proposed managed relational store. ${i===0?'Clients use the writer endpoint. TLS is required by this design.':'This is a Multi-AZ DB-instance standby, not a read replica; application reads must not be routed here.'} PostgreSQL hosting, version, encryption, backups and failover are deployment assumptions; repository models establish only application persistence concepts.`,[storeSource],dify?'db_postgres':cal?'database':undefined);
    add(`cache-${az}`,i===0?'Redis · primary':'Redis · replica',i===0?'Cache / broker · TLS :6379':'Replica / failover candidate',right,1052,'queue','Proposed managed Redis-compatible replication group. Redis is a repository service where Compose evidence exists. TLS, failover, queue durability, backup and compatibility must be validated; replication is not an exactly-once delivery guarantee.',[],graph.runtime?.services.some(s=>s.name==='redis')?'redis':undefined);
    if(dify) add(`vector-${az}`,`Vector backend · node ${upper}`,'Qdrant example · HA to validate',left,1185,'database','Qdrant is selected for this reference; Weaviate is an alternative, not a second replica engine. Multi-node placement does not establish quorum, replication factor or recovery behavior. Validate backend cluster settings, storage, TLS, ports and backups.', ['vector-store'],'qdrant');
  }
  add('endpoint','S3 gateway VPC endpoint','Route-table association · no public IP',500,1322,'network','Proposed S3 gateway endpoint associated with the private app route tables. S3 traffic stays off NAT for matched S3 prefix-list routes. Endpoint and bucket policies limit permitted access.');
  add('s3','Amazon S3','Uploads / documents / media',1375,370,'storage','Proposed object store. Application storage configuration must support S3 before migration; mounted local volumes are not transparently interchangeable with object storage. Access uses task IAM and bucket policies.');
  add('secrets','Secrets Manager + KMS','Per-task secret access',1375,580,'security','Proposed runtime secret delivery and encryption controls. Use execution/task role permissions as appropriate; secret rotation and connection refresh require implementation. KMS is not drawn as a packet proxy.');
  add('logs','CloudWatch / tracing','Logs, metrics, traces, alarms',1375,790,'observe','Proposed operational telemetry. Collect ALB target errors, API latency, worker queue age, failed jobs, DB connections, Redis memory and NAT errors. Redact credentials and user content.');
  add('registry','ECR / deployment pipeline','Immutable images → rolling release',1375,1000,'compute','Proposed image registry and deployment pipeline. Tasks pull images using their execution role. Rolling deployments need health gates, rollback and schema-migration coordination.');

  link('dns-query','client','dns','DNS lookup / alias','DNS','request','Resolve the application hostname. Resolver and caching details are omitted.','Public DNS; no application payload');
  link('waf-association','waf','alb-a','Web ACL association','Policy attachment','request','WAF evaluates HTTP requests at the ALB; this line shows a policy association.','WAF rules plus ALB listener policy');
  link('internet','client','igw','1 · HTTPS entry','TLS 443','request','Client reaches the internet-facing ALB via the VPC internet gateway.','sg-alb ingress TCP 443 from internet');
  for(const az of ['a','b']) {
    link(`ingress-${az}`,'igw',`alb-${az}`,'2 · Public ingress','TLS 443','request','The ALB spans both public subnets; either healthy zone may receive traffic.','sg-alb listener 443; HTTP→HTTPS redirect optional');
    link(`target-${az}`,`alb-${az}`,`api-${az}`,`3 · Target group :${appPort}`,`HTTP ${appPort} · proposed`,'request','Forward to a healthy private target. Backend TLS/re-encryption is a separate design choice; this example uses HTTP within the VPC.','sg-app allows only sg-alb on target + health-check ports');
    link(`sql-${az}`,`api-${az}`,'db-a','4 · Read / write','PostgreSQL TLS 5432','data','Both AZs use the writer endpoint. Model/query behavior is grounded in the selected source; managed DB placement is proposed.','sg-db allows sg-app/sg-worker only; no public ingress');
    link(`broker-${az}`,`api-${az}`,'cache-a',cal?'Cache access':'Enqueue / cache','Redis TLS 6379','data',cal?'Redis access semantics must be verified before this cache design is adopted.':'Proposed Redis broker/cache path. A startup depends_on entry alone does not prove the protocol or delivery semantics.','sg-cache allows approved app and worker security groups');
    if(!cal) link(`consume-${az}`,`job-${az}`,'cache-a','Consume / acknowledge','Redis TLS 6379','data','Workers initiate broker connections; no inbound Internet listener is required. Retries and idempotency need application-level guarantees.','sg-worker egress → sg-cache 6379');
    link(`job-sql-${az}`,`job-${az}`,'db-a',cal?'Integration state':'Persist job results','PostgreSQL TLS 5432','data','Proposed persistence path for execution results and state. Confirm transaction boundaries in application code.','sg-db permits approved worker/app identity only');
    link(`route-${az}`,`api-${az}`,`routes-${az}`,'Outbound route selection','IPv4 route','egress','Route lookup chooses local, S3 prefix-list, or default NAT routing. Route table is conceptual, not an application proxy.','App subnet route-table association');
    link(`nat-route-${az}`,`routes-${az}`,`nat-${az}`,'0.0.0.0/0','IPv4 default','egress','Internet-bound IPv4 traffic follows the local zone NAT gateway.','Destination policy via proxy/firewall; NAT does not enforce it');
    link(`nat-igw-${az}`,`nat-${az}`,'igw','Egress translation','Outbound IPv4','egress','Public NAT sends translated traffic through the internet gateway.','Return traffic only; no direct inbound to private tasks');
    link(`storage-${az}`,`api-${az}`,'endpoint','S3 prefix-list route','HTTPS 443','operations','Proposed direct S3 access over a gateway endpoint. SDK/bucket configuration needs to match this design.','Task IAM + endpoint policy + bucket policy');
    link(`telemetry-${az}`,`api-${az}`,'logs','Logs / metrics','HTTPS 443','operations','Telemetry reaches regional service endpoints over private interface endpoints or NAT. Interface endpoints are not included in this diagram.','Execution/task role + selected egress route');
  }
  link('providers','igw','provider','Provider request / response','HTTPS 443','egress','External callbacks enter through the public ALB; outbound provider requests use NAT. Do not treat this line as private connectivity.','Provider auth, allowlists, timeout, retry and payload policy');
  link('replication','db-a','db-b','Synchronous standby replication','Managed RDS','data','RDS Multi-AZ DB-instance replication and failover are managed. Standby is not a readable endpoint.','Managed replication; application uses writer endpoint');
  link('redis-replication','cache-a','cache-b','Async replication / failover','Managed Redis','data','Proposed cache/broker replication. Recent writes may be lost on failover depending on configuration.','Managed replication; validate client failover behavior');
  if(dify) for(const az of ['a','b']) link(`vector-access-${az}`,`api-${az}`,`vector-${az}`,'Retrieve embeddings','Backend-specific · confirm','data','Select one vector backend. Query ports, TLS and replication must be validated for that backend.','Dedicated vector SG; API/worker sources only');
  link('bucket','endpoint','s3','Object API','HTTPS 443','operations','Gateway endpoint routes S3 requests; the bucket is a regional service outside the VPC address space.','Endpoint and bucket policies restrict paths/actions');
  link('credentials','api-a','secrets','Secret retrieval / injection','HTTPS 443','operations','Application retrieval or task-start secret injection depends on the delivery method; each requires appropriate IAM permissions.','Execution/task role and KMS decrypt scoped to named secrets');
  link('image-pull','api-b','registry','Image pull at startup','HTTPS 443','operations','ECR API and registry connectivity require NAT or private endpoints; image layers may also require S3 access.','Task execution role, repository policy and network routes');

  return {resources,connections,boundaries,routes:[
    {table:'Public A / B',destination:'10.42.0.0/16',target:'local',reason:'Intra-VPC traffic'},
    {table:'Public A / B',destination:'0.0.0.0/0',target:'Internet gateway',reason:'Public ALB / NAT internet connectivity'},
    {table:'Private app A',destination:'0.0.0.0/0',target:'NAT A',reason:'Zonal outbound IPv4'},
    {table:'Private app B',destination:'0.0.0.0/0',target:'NAT B',reason:'Zonal outbound IPv4'},
    {table:'Private app A / B',destination:'S3 managed prefix list',target:'S3 gateway endpoint',reason:'Keep S3 requests off NAT'},
    {table:'Isolated data A / B',destination:'10.42.0.0/16',target:'local · no default',reason:'No direct Internet route'},
  ],decisions:[
    {title:'Evidence boundary',detail:'The repository establishes source files and selected container configuration. All AWS resources, CIDRs, availability zones, target ports, security rules and scaling policies are proposed. This is not the project’s discovered production architecture.'},
    {title:'Availability & failure modes',detail:'Two app zones and same-AZ NAT avoid a single zonal compute/egress dependency. Database failover, cache consistency, worker retry and vector-backend HA must be tested. No recovery objective is implied.'},
    {title:'Operational decisions still needed',detail:'Choose region, capacity, task scaling, backend TLS, health endpoints, DB migrations, backup retention, RPO/RTO, rate limits and alerts. Do not copy this reference as production IaC.'},
    {title:'Repository-specific adaptation',detail:dify?'PostgreSQL is selected for this reference; MySQL is an alternative. Weaviate/Qdrant are alternative examples. Sandbox/plugin tasks need explicit isolation. Local filesystem mounts require a deliberate S3/EFS strategy.':cal?'Next.js serves both UI and API. Redis and PostgreSQL appear in Compose. Calendar/payment adapters do not establish a separate worker deployment.': 'This snapshot has code/model evidence but no parsed deployment manifest. API port 8000, PostgreSQL, Redis/Celery placement and ECS hosting must be confirmed against an actual deployment.'},
  ]};
}

export const referenceLinks = [{label:'AWS: private subnets, ALB and zonal NAT',url:awsNetwork},{label:'AWS: ECS security group boundaries',url:awsSecurity},{label:'AWS: private task outbound connectivity',url:awsEgress}];
