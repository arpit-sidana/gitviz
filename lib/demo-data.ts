import type { RepositoryGraph } from './graph';

const evidence = (path: string, note: string, commitSha: string, lines?: string) => ({ path, note, commitSha, lines });

export const demos: RepositoryGraph[] = [
  {
    schemaVersion: '0.2',
    repository: { owner: 'calcom', name: 'cal.com', url: 'https://github.com/calcom/cal.com', purpose: 'Open scheduling infrastructure for individuals and teams.', defaultBranch: 'main', commitSha: 'demo-cal-2026', analyzedAt: 'Precomputed demo snapshot', analysisTier: 'precomputed', languages: ['TypeScript', 'React', 'Next.js'], limitations: ['Snapshot is illustrative and pinned for the GitViz prototype.', 'Runtime behavior is inferred from repository structure, not production traces.'] },
    capabilities: [
      { id: 'booking', name: 'Create a booking', summary: 'A guest chooses a time, supplies attendee details, and creates a calendar event.', nodeIds: ['booking-page','booking-api','booking-service','booking-db','calendar'] },
      { id: 'availability', name: 'Manage availability', summary: 'A host defines schedules and date overrides used to calculate bookable slots.', nodeIds: ['availability-ui','availability-api','availability-db'] },
      { id: 'payments', name: 'Collect payment', summary: 'Paid event types create a payment intent before a booking is confirmed.', nodeIds: ['booking-page','payment-service','stripe'] },
    ],
    nodes: [
      { id:'booking-page', type:'UI_SURFACE', label:'Booking page', detail:'Guest-facing event page and booking form.', evidence:[evidence('apps/web/app/[user]/[type]/page.tsx','Dynamic booking page entry point.','demo-cal-2026','1–80')] },
      { id:'booking-api', type:'ENDPOINT', label:'Booking endpoint', detail:'Validates the request and hands booking creation to the domain layer.', evidence:[evidence('apps/api/v2/src/modules/bookings/controllers/bookings.controller.ts','Booking API controller.','demo-cal-2026','24–118')] },
      { id:'booking-service', type:'SERVICE', label:'Booking service', detail:'Coordinates availability, attendee, calendar, and notification work.', evidence:[evidence('packages/features/bookings/lib/handleNewBooking.ts','Booking orchestration.','demo-cal-2026','90–240')] },
      { id:'booking-db', type:'DATA_STORE', label:'Booking model', detail:'Persists booking state, attendees, references, and status.', evidence:[evidence('packages/prisma/schema.prisma','Booking and attendee records.','demo-cal-2026','450–560')] },
      { id:'calendar', type:'EXTERNAL_DEPENDENCY', label:'Calendar providers', detail:'Creates and updates events in connected calendars.', evidence:[evidence('packages/lib/CalendarManager.ts','Provider abstraction and event creation.','demo-cal-2026','40–190')] },
      { id:'availability-ui', type:'UI_SURFACE', label:'Availability editor', detail:'Host schedule editor and date overrides.', evidence:[evidence('apps/web/app/availability/[schedule]/page.tsx','Availability management surface.','demo-cal-2026')] },
      { id:'availability-api', type:'SERVICE', label:'Availability service', detail:'Calculates bookable windows from schedules and busy times.', evidence:[evidence('packages/lib/slots.ts','Slot calculation logic.','demo-cal-2026')] },
      { id:'availability-db', type:'DATA_STORE', label:'Schedule model', detail:'Stores weekly schedules and date overrides.', evidence:[evidence('packages/prisma/schema.prisma','Schedule and availability models.','demo-cal-2026','760–840')] },
      { id:'payment-service', type:'SERVICE', label:'Payment orchestration', detail:'Creates payment intent and links it to a pending booking.', evidence:[evidence('packages/features/ee/payments/lib/payment.ts','Payment setup for bookings.','demo-cal-2026')] },
      { id:'stripe', type:'EXTERNAL_DEPENDENCY', label:'Stripe', detail:'External payment processor.', evidence:[evidence('packages/app-store/stripepayment/lib/PaymentService.ts','Stripe payment adapter.','demo-cal-2026')] },
    ],
    edges: [
      ['booking-page','booking-api','ROUTES_TO'],['booking-api','booking-service','CALLS'],['booking-service','booking-db','WRITES_TO'],['booking-service','calendar','DEPENDS_ON'],['availability-ui','availability-api','CALLS'],['availability-api','availability-db','READS_FROM'],['booking-page','payment-service','CALLS'],['payment-service','stripe','DEPENDS_ON']
    ].map(([source,target,type], i) => ({ id:`cal-e${i}`, source, target, type:type as never, evidence:[evidence('GitViz deterministic trace','Relationship derived from referenced source nodes.','demo-cal-2026')] })),
    evolution: [
      { date:'Aug 18', title:'Booking flow refinements', detail:'Booking UI and orchestration changed together.', capabilityId:'booking', files:14, commitSha:'cal-a18' },
      { date:'Aug 09', title:'Availability calculation', detail:'Slot and schedule handling received concentrated changes.', capabilityId:'availability', files:9, commitSha:'cal-a09' },
      { date:'Jul 27', title:'Payment adapter updates', detail:'Payment provider integration and booking state were updated.', capabilityId:'payments', files:7, commitSha:'cal-j27' },
    ],
    evaluations: [
      { question:'Where does a guest booking enter the system?', answer:'The dynamic booking page routes into the bookings controller.', status:'passed', evidenceIds:['booking-page','booking-api'] },
      { question:'What persists a confirmed booking?', answer:'The booking service writes booking and attendee state through the Prisma Booking model.', status:'passed', evidenceIds:['booking-service','booking-db'] },
      { question:'Which external system receives the calendar event?', answer:'A provider behind CalendarManager receives the event.', status:'passed', evidenceIds:['calendar'] },
      { question:'Can GitViz prove production runtime ordering?', answer:'No. This snapshot provides structural evidence, not a production trace.', status:'partial', evidenceIds:[] },
    ],
  },
  {
    schemaVersion:'0.2', repository:{ owner:'saleor', name:'saleor', url:'https://github.com/saleor/saleor', purpose:'A GraphQL-first commerce platform for products, checkout, payments, and orders.', defaultBranch:'main', commitSha:'demo-saleor-2026', analyzedAt:'Precomputed demo snapshot', analysisTier:'precomputed', languages:['Python','GraphQL','Django'], limitations:['Illustrative pinned snapshot.','Plugin execution is not runtime-traced.'] },
    capabilities:[
      { id:'checkout', name:'Complete checkout', summary:'A storefront updates a checkout, authorizes payment, and creates an order.', nodeIds:['graphql','checkout-resolver','checkout-service','checkout-model','payment-plugin'] },
      { id:'catalog', name:'Browse catalog', summary:'GraphQL queries expose products, variants, pricing, and availability.', nodeIds:['graphql','product-resolver','product-model'] },
      { id:'webhooks', name:'Notify integrations', summary:'Domain events are delivered to configured app webhooks.', nodeIds:['checkout-service','webhook-job','external-app'] },
    ],
    nodes:[
      { id:'graphql',type:'ENDPOINT',label:'GraphQL API',detail:'Single typed API entry point for storefront and dashboard operations.',evidence:[evidence('saleor/graphql/schema.py','Root GraphQL schema.','demo-saleor-2026')] },
      { id:'checkout-resolver',type:'SERVICE',label:'Checkout mutations',detail:'Validates checkout operations and calls domain services.',evidence:[evidence('saleor/graphql/checkout/mutations/checkout_complete.py','Checkout completion mutation.','demo-saleor-2026')] },
      { id:'checkout-service',type:'SERVICE',label:'Checkout completion',detail:'Coordinates stock, payment, order creation, and events.',evidence:[evidence('saleor/checkout/complete_checkout.py','Checkout domain orchestration.','demo-saleor-2026')] },
      { id:'checkout-model',type:'DATA_STORE',label:'Checkout + Order models',detail:'Persists commerce state and resulting orders.',evidence:[evidence('saleor/checkout/models.py','Checkout persistence.','demo-saleor-2026'),evidence('saleor/order/models.py','Order persistence.','demo-saleor-2026')] },
      { id:'payment-plugin',type:'EXTERNAL_DEPENDENCY',label:'Payment plugins',detail:'Provider boundary for authorization and capture.',evidence:[evidence('saleor/payment/gateway.py','Payment gateway manager.','demo-saleor-2026')] },
      { id:'product-resolver',type:'SERVICE',label:'Product resolvers',detail:'Resolves catalog queries, filters, and channel context.',evidence:[evidence('saleor/graphql/product/resolvers.py','Catalog query resolvers.','demo-saleor-2026')] },
      { id:'product-model',type:'DATA_STORE',label:'Product models',detail:'Products, variants, media, and collections.',evidence:[evidence('saleor/product/models.py','Catalog domain models.','demo-saleor-2026')] },
      { id:'webhook-job',type:'JOB',label:'Webhook delivery',detail:'Asynchronously sends subscribed domain events.',evidence:[evidence('saleor/webhook/transport/asynchronous/transport.py','Async webhook transport.','demo-saleor-2026')] },
      { id:'external-app',type:'EXTERNAL_DEPENDENCY',label:'Saleor app',detail:'Receives signed webhook payloads.',evidence:[evidence('saleor/webhook/models.py','App webhook subscriptions.','demo-saleor-2026')] },
    ],
    edges:[['graphql','checkout-resolver','ROUTES_TO'],['checkout-resolver','checkout-service','CALLS'],['checkout-service','checkout-model','WRITES_TO'],['checkout-service','payment-plugin','DEPENDS_ON'],['graphql','product-resolver','ROUTES_TO'],['product-resolver','product-model','READS_FROM'],['checkout-service','webhook-job','EMITS'],['webhook-job','external-app','DEPENDS_ON']].map(([source,target,type],i)=>({id:`saleor-e${i}`,source,target,type:type as never,evidence:[evidence('GitViz deterministic trace','Relationship derived from referenced source nodes.','demo-saleor-2026')]})),
    evolution:[{date:'Aug 20',title:'Checkout completion',detail:'Checkout validation and order creation changed together.',capabilityId:'checkout',files:18,commitSha:'sal-a20'},{date:'Aug 11',title:'Catalog filtering',detail:'GraphQL filters and product resolvers evolved.',capabilityId:'catalog',files:11,commitSha:'sal-a11'},{date:'Jul 31',title:'Webhook delivery',detail:'Async transport and retry behavior changed.',capabilityId:'webhooks',files:8,commitSha:'sal-j31'}],
    evaluations:[{question:'Where does checkout completion begin?',answer:'The GraphQL checkoutComplete mutation is the domain entry point.',status:'passed',evidenceIds:['graphql','checkout-resolver']},{question:'Which layer creates an order?',answer:'Checkout completion coordinates persistence through checkout and order models.',status:'passed',evidenceIds:['checkout-service','checkout-model']},{question:'How are integrations notified?',answer:'The checkout service emits work to asynchronous webhook delivery.',status:'passed',evidenceIds:['webhook-job','external-app']},{question:'Can GitViz verify a plugin provider response?',answer:'No. The graph proves the plugin boundary, not a live provider response.',status:'partial',evidenceIds:[]}],
  },
  {
    schemaVersion:'0.2', repository:{owner:'langgenius',name:'dify',url:'https://github.com/langgenius/dify',purpose:'A visual platform for building AI workflows, agents, and retrieval applications.',defaultBranch:'main',commitSha:'demo-dify-2026',analyzedAt:'Precomputed demo snapshot',analysisTier:'precomputed',languages:['TypeScript','Python','React'],limitations:['Illustrative pinned snapshot.','Model-provider behavior varies by deployment.']},
    capabilities:[
      {id:'workflow',name:'Run an AI workflow',summary:'A published app sends input through a visual graph of model, tool, and logic nodes.',nodeIds:['workflow-ui','workflow-api','workflow-engine','run-store','model-provider']},
      {id:'rag',name:'Retrieve knowledge',summary:'Documents are indexed and retrieved as context for model execution.',nodeIds:['dataset-ui','index-job','vector-store','workflow-engine']},
      {id:'observe',name:'Inspect a run',summary:'Operators inspect inputs, outputs, node execution, timing, and errors.',nodeIds:['run-ui','run-api','run-store']},
    ],
    nodes:[
      {id:'workflow-ui',type:'UI_SURFACE',label:'Workflow canvas',detail:'Visual editor for connecting model, tool, and control nodes.',evidence:[evidence('web/app/components/workflow/index.tsx','Workflow editor surface.','demo-dify-2026')]},
      {id:'workflow-api',type:'ENDPOINT',label:'Workflow API',detail:'Accepts app execution requests and validates inputs.',evidence:[evidence('api/controllers/console/app/workflow.py','Workflow execution endpoint.','demo-dify-2026')]},
      {id:'workflow-engine',type:'SERVICE',label:'Graph engine',detail:'Schedules nodes, propagates state, and records results.',evidence:[evidence('api/core/workflow/graph_engine/graph_engine.py','Graph execution engine.','demo-dify-2026')]},
      {id:'run-store',type:'DATA_STORE',label:'Workflow run records',detail:'Persists run status, node execution, inputs, outputs, and errors.',evidence:[evidence('api/models/workflow.py','Workflow run models.','demo-dify-2026')]},
      {id:'model-provider',type:'EXTERNAL_DEPENDENCY',label:'Model providers',detail:'Provider abstraction for hosted and local language models.',evidence:[evidence('api/core/model_manager.py','Model provider selection.','demo-dify-2026')]},
      {id:'dataset-ui',type:'UI_SURFACE',label:'Knowledge editor',detail:'Creates datasets and manages documents.',evidence:[evidence('web/app/(commonLayout)/datasets/page.tsx','Dataset management surface.','demo-dify-2026')]},
      {id:'index-job',type:'JOB',label:'Document indexing',detail:'Segments, embeds, and indexes document content.',evidence:[evidence('api/tasks/document_indexing_task.py','Asynchronous indexing task.','demo-dify-2026')]},
      {id:'vector-store',type:'DATA_STORE',label:'Vector index',detail:'Stores embeddings used during retrieval.',evidence:[evidence('api/core/rag/datasource/vdb/vector_factory.py','Vector-store factory.','demo-dify-2026')]},
      {id:'run-ui',type:'UI_SURFACE',label:'Run inspector',detail:'Shows node-level traces and outputs.',evidence:[evidence('web/app/components/workflow/run/index.tsx','Run inspection UI.','demo-dify-2026')]},
      {id:'run-api',type:'ENDPOINT',label:'Run detail API',detail:'Returns persisted workflow and node execution details.',evidence:[evidence('api/controllers/console/app/workflow.py','Run detail controller.','demo-dify-2026')]},
    ],
    edges:[['workflow-ui','workflow-api','ROUTES_TO'],['workflow-api','workflow-engine','CALLS'],['workflow-engine','run-store','WRITES_TO'],['workflow-engine','model-provider','DEPENDS_ON'],['dataset-ui','index-job','CALLS'],['index-job','vector-store','WRITES_TO'],['workflow-engine','vector-store','READS_FROM'],['run-ui','run-api','ROUTES_TO'],['run-api','run-store','READS_FROM']].map(([source,target,type],i)=>({id:`dify-e${i}`,source,target,type:type as never,evidence:[evidence('GitViz deterministic trace','Relationship derived from referenced source nodes.','demo-dify-2026')]})),
    evolution:[{date:'Aug 21',title:'Workflow engine',detail:'Graph execution and node state handling changed together.',capabilityId:'workflow',files:22,commitSha:'dif-a21'},{date:'Aug 13',title:'Knowledge indexing',detail:'Document processing and vector adapters changed.',capabilityId:'rag',files:16,commitSha:'dif-a13'},{date:'Aug 02',title:'Run observability',detail:'Trace APIs and inspector UI were refined.',capabilityId:'observe',files:10,commitSha:'dif-a02'}],
    evaluations:[{question:'Where does a workflow run begin?',answer:'The workflow API accepts the request and invokes the graph engine.',status:'passed',evidenceIds:['workflow-api','workflow-engine']},{question:'Where are run details persisted?',answer:'Workflow run models store run and node execution state.',status:'passed',evidenceIds:['run-store']},{question:'How does retrieval join workflow execution?',answer:'The graph engine reads retrieved context through the vector-store boundary.',status:'passed',evidenceIds:['workflow-engine','vector-store']},{question:'Can GitViz guarantee a model response?',answer:'No. Provider runtime output is outside this structural snapshot.',status:'partial',evidenceIds:[]}],
  },
];

