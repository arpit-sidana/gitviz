type Box = {id:string;x:number;y:number};
type Edge = {id:string;source:string;target:string};
type Point = {x:number;y:number};
export type RoutedEdge = {path:string;lx:number;ly:number;points:Point[]};

// Fixed-grid A*: routes may cross boundary outlines but never resource bodies.
export function routeConnections(boxes:Box[],edges:Edge[]):Map<string,RoutedEdge> {
  const step=10,columns=169,rows=147,size=columns*rows;
  const blocked=new Uint8Array(size);
  for(const box of boxes) for(let y=Math.ceil((box.y-4)/step);y<=Math.floor((box.y+102)/step);y++) for(let x=Math.ceil((box.x-4)/step);x<=Math.floor((box.x+239)/step);x++) if(x>=0&&y>=0&&x<columns&&y<rows) blocked[y*columns+x]=1;
  const output=new Map<string,RoutedEdge>();
  for(const edge of edges) {
    const a=boxes.find(b=>b.id===edge.source),b=boxes.find(b=>b.id===edge.target);
    if(!a||!b) throw new Error(`Unresolved architecture connection ${edge.id}`);
    const horizontal=Math.abs(a.x-b.x)>Math.abs(a.y-b.y);
    const forward=horizontal?b.x>a.x:b.y>a.y;
    const from={x:a.x+(horizontal?(forward?235:0):117.5),y:a.y+(horizontal?49:forward?98:0)};
    const to={x:b.x+(horizontal?(forward?0:235):117.5),y:b.y+(horizontal?49:forward?0:98)};
    const anchor=(p:Point,direction:number)=>({x:Math.round((p.x+(horizontal?direction*24:0))/step),y:Math.round((p.y+(horizontal?0:direction*24))/step)});
    const start=anchor(from,forward?1:-1),goal=anchor(to,forward?-1:1);
    const startId=start.y*columns+start.x,goalId=goal.y*columns+goal.x;
    const cost=new Float64Array(size);cost.fill(Infinity);cost[startId]=0;
    const parent=new Int32Array(size);parent.fill(-1);
    const closed=new Uint8Array(size);
    const heap:{id:number;rank:number}[]=[];
    function push(value:{id:number;rank:number}) {heap.push(value);let index=heap.length-1;while(index>0){const prev=(index-1)>>1;if(heap[prev].rank<=value.rank)break;heap[index]=heap[prev];index=prev;}heap[index]=value;}
    function pop(){const first=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].rank<heap[child].rank)child++;if(heap[child].rank>=last.rank)break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;}
    const heuristic=(id:number)=>Math.abs(id%columns-goal.x)+Math.abs(Math.floor(id/columns)-goal.y);
    push({id:startId,rank:heuristic(startId)});
    while(heap.length) {
      const current=pop().id;if(closed[current])continue;closed[current]=1;if(current===goalId)break;
      const x=current%columns,y=Math.floor(current/columns);
      for(const [nx,ny] of [[x+1,y],[x,y+1],[x-1,y],[x,y-1]]) {
        if(nx<1||ny<1||nx>=columns-1||ny>=rows-1)continue;
        const next=ny*columns+nx;if(closed[next]||(blocked[next]&&next!==goalId&&next!==startId))continue;
        const previous=parent[current];
        const turns=previous!==-1&&(current-previous!==next-current);
        const candidate=cost[current]+1+(turns?6:0);
        if(candidate>=cost[next])continue;cost[next]=candidate;parent[next]=current;push({id:next,rank:candidate+heuristic(next)});
      }
    }
    if(!closed[goalId]) throw new Error(`No unobstructed route for ${edge.id}`);
    const raw:Point[]=[];let id=goalId;while(id!==-1){raw.push({x:id%columns*step,y:Math.floor(id/columns)*step});id=parent[id];}raw.reverse();
    // Attach orthogonal docking segments to the card boundary.
    const route=[from,...(horizontal?[{x:raw[0].x,y:from.y}]:[{x:from.x,y:raw[0].y}]),...raw,...(horizontal?[{x:raw.at(-1)!.x,y:to.y}]:[{x:to.x,y:raw.at(-1)!.y}]),to];
    const points:Point[]=[];
    for(const p of route){if(points.length&&points.at(-1)!.x===p.x&&points.at(-1)!.y===p.y)continue;while(points.length>1){const prev=points[points.length-2],last=points.at(-1)!;if((prev.x===last.x&&last.x===p.x)||(prev.y===last.y&&last.y===p.y))points.pop();else break;}points.push(p);}
    let label={x:points[0].x,y:points[0].y},longest=-1;
    for(let i=1;i<points.length;i++){const left=points[i-1],right=points[i];const length=Math.abs(left.x-right.x)+(left.y===right.y?70:Math.abs(left.y-right.y));if(length>longest){longest=length;label={x:(left.x+right.x)/2,y:(left.y+right.y)/2};}}
    output.set(edge.id,{path:points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),lx:label.x+6,ly:label.y-7,points});
  }
  return output;
}
