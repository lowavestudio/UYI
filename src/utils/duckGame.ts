export const ROUND_SECONDS = 30
export type Duck = { id:number, x:number, y:number, direction:number, speed:number, age:number }
export type Round = {status:'ready'|'playing'|'paused'|'finished',remaining:number,hits:number,shots:number,ducks:Duck[],untilSpawn:number,nextId:number}
export function createRound():Round{return {status:'ready',remaining:ROUND_SECONDS,hits:0,shots:0,ducks:[],untilSpawn:.3,nextId:1}}
export function advanceRound(r:Round,dt:number,random:()=>number=Math.random):Round{
 if(r.status!=='playing')return r
 const remaining=Math.max(0,r.remaining-dt)
 if(remaining===0)return {...r,remaining:0,status:'finished',ducks:[]}
 let ducks=r.ducks.map(d=>({...d,x:d.x+d.direction*d.speed*dt,age:d.age+dt})).filter(d=>d.x> -12&&d.x<112)
 let untilSpawn=r.untilSpawn-dt,nextId=r.nextId
 if(untilSpawn<=0&&ducks.length<3){const direction=random()<.5?1:-1;ducks=[...ducks,{id:nextId++,x:direction===1?8:92,y:18+random()*43,direction,speed:9+random()*5+(ROUND_SECONDS-remaining)*.12,age:0}];untilSpawn=1.3}
 return {...r,remaining,ducks,untilSpawn,nextId}
}
export function shoot(r:Round,id:number|null):Round{
 if(r.status!=='playing')return r
 const hit=id!==null&&r.ducks.some(d=>d.id===id)
 return {...r,shots:r.shots+1,hits:r.hits+(hit?1:0),ducks:hit?r.ducks.filter(d=>d.id!==id):r.ducks}
}
