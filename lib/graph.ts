export type Depth = 'orientation' | 'trace' | 'inspect';
export type Tab = 'overview' | 'flow' | 'architecture' | 'evolution' | 'evaluation';

export type Evidence = {
  path: string;
  lines?: string;
  commitSha: string;
  note: string;
};

export type GraphNode = {
  id: string;
  type: 'UI_SURFACE' | 'ENDPOINT' | 'SERVICE' | 'DATA_STORE' | 'JOB' | 'EXTERNAL_DEPENDENCY' | 'FEATURE';
  label: string;
  detail: string;
  evidence: Evidence[];
  basis?: 'repository' | 'assumption';
  zone?: 'clients' | 'application' | 'data' | 'external';
  architectureDetails?: { label: string; value: string; basis: 'repository' | 'proposal' }[];
  references?: { label: string; url: string }[];
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: 'ROUTES_TO' | 'CALLS' | 'READS_FROM' | 'WRITES_TO' | 'DEPENDS_ON' | 'EMITS';
  evidence: Evidence[];
};

export type Capability = {
  id: string;
  name: string;
  summary: string;
  nodeIds: string[];
};

export type EvolutionEvent = {
  date: string;
  title: string;
  detail: string;
  capabilityId: string;
  files: number;
  commitSha: string;
  prUrl?: string;
  prNumber?: number;
  prTitle?: string;
  value?: string;
  group?: string;
  additions?: number;
  deletions?: number;
  paths?: string[];
};

export type Evaluation = {
  question: string;
  answer: string;
  status: 'passed' | 'partial';
  evidenceIds: string[];
};

export type RepositoryGraph = {
  schemaVersion: '0.2';
  repository: {
    owner: string;
    name: string;
    url: string;
    purpose: string;
    defaultBranch: string;
    commitSha: string;
    analyzedAt: string;
    analysisTier: 'precomputed';
    languages: string[];
    limitations: string[];
    snapshotDate?: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  capabilities: Capability[];
  evolution: EvolutionEvent[];
  evaluations: Evaluation[];
  runtime?: {
    services: { name: string; image?: string; ports: string[]; networks: string[]; volumes: string[]; profiles: string[]; dependencies: string[]; healthcheck: boolean; evidence: Evidence }[];
    networks: string[];
  };
};

