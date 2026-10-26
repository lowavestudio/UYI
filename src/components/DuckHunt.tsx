import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Crosshair, Trophy } from 'lucide-react'
import { createRound, advanceRound, shoot, ROUND_SECONDS } from '../utils/duckGame'
import type { Round } from '../utils/duckGame'
import './duck-hunt.css'

function Duck({id}:{id:number}) {
 return <svg viewBox="0 0 64 64" aria-hidden="true" shapeRendering="crispEdges"><g className="duck-wing"><path fill="#dbc68c" d="M20 30h8V18h8V10h8v18h-8v12H20z"/><path fill="#a2844c" d="M28 18h8v16h-8z"/></g><path fill={id%2?'#b98d50':'#d5ba81'} d="M8 34h8v-8h24v8h8v16H20v-6H8z"/><path fill="#243b32" d="M36 16h16v8h8v12H44v-8h-8z"/><path fill="#eee1bb" d="M40 30h12v6H40z"/><path fill="#d6a953" d="M52 24h12v8H52zM24 50h8v6h-8z"/><path fill="#141d19" d="M46 20h4v4h-4z"/><path fill="#77572d" d="M20 36h16v8H20z"/></svg>
}
export function DuckHunt(){
 const [round,setRound]=useState<Round>(()=>createRound())
 const [best,setBest]=useState(()=>{try{return Number(localStorage.getItem('usovik-duck-best'))||0}catch{return 0}})
 const [flash,setFlash]=useState<{x:number,y:number,hit:boolean}|null>(null)
 const [aim,setAim]=useState({x:50,y:45})
 const field=useRef<HTMLDivElement>(null), current=useRef(round), shotAt=useRef(0)
 const flashTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined)
 function update(r:Round){current.current=r;setRound(r)}
 function pause(){if(current.current.status==='playing')update({...current.current,status:'paused'})}
 function focusField(){field.current?.focus({preventScroll:true});field.current?.previousElementSibling?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 function resume(){update({...current.current,status:'playing'});focusField()}
 function start(){shotAt.current=0;setFlash(null);update({...createRound(),status:'playing'});focusField()}
 function fire(id:number|null,x:number,y:number){
  const now=performance.now();if(current.current.status!=='playing'||now-shotAt.current<140)return
  shotAt.current=now;const r=shoot(current.current,id);update(r);setFlash({x,y,hit:id!==null});clearTimeout(flashTimer.current);flashTimer.current=setTimeout(()=>setFlash(null),300)
 }
 useEffect(()=>{
  let frame=0, previous=0, lastPaint=0
  const step=(now:number)=>{
   if(!previous)previous=now
   const delta=Math.max(0,(now-previous)/1000);previous=now
   if(current.current.status==='playing'){
    current.current=advanceRound(current.current,delta)
    if(now-lastPaint>32||current.current.status==='finished'){setRound({...current.current});lastPaint=now}
   }
   frame=requestAnimationFrame(step)
  }
  frame=requestAnimationFrame(step)
  const hidden=()=>{previous=0;if(document.hidden)pause()}; const blur=()=>pause()
  document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',blur)
  return()=>{cancelAnimationFrame(frame);clearTimeout(flashTimer.current);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',blur)}
 },[])
 useEffect(()=>{if(round.status==='finished'&&round.hits*10>best){const n=round.hits*10;setBest(n);try{localStorage.setItem('usovik-duck-best',String(n))}catch{/* Storage may be disabled. */}}},[round.status,round.hits,best])
 return <section id="duck-hunt" className="duck-game" data-game="true" aria-label="Мини-игра Утиная охота">
 <div className="game-heading"><div><span className="eyebrow">Пауза между страницами / Только для Вас</span><h2>Меткость — <em>в характере.</em></h2></div><span className="game-edition">THE ARCADE ISSUE<br/>8-BIT / SPECIAL EDITION</span></div>
 <p className="game-intro">Небольшая охота в духе любимой приставки. Коснитесь утки или нажмите на неё мышью. У Вас {ROUND_SECONDS} секунд.</p>
 <div className="game-scoreboard"><span><small>СЧЁТ</small><b>{String(round.hits*10).padStart(3,'0')}</b></span><span><small>ВРЕМЯ</small><b>{Math.ceil(round.remaining)}<i> сек</i></b></span><span><small>РЕКОРД</small><b><Trophy size={14}/>{best}</b></span><button className="game-pause" onClick={()=>round.status==='playing'?pause():round.status==='paused'?resume():start()} aria-label={round.status==='playing'?'Пауза':round.status==='paused'?'Продолжить игру':'Начать игру'}>{round.status==='playing'?<Pause size={18}/>:<Play size={18}/>}</button></div>
 <div ref={field} className={'game-field '+(round.status==='playing'?'is-playing':'')} tabIndex={0} role="group" aria-label="Игровое поле. Стрелки — прицел, пробел — выстрел. Escape — пауза."
 onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='Escape'){pause();return}if(e.key.startsWith('Arrow')){e.preventDefault();setAim(a=>({x:Math.max(5,Math.min(95,a.x+(e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0))),y:Math.max(8,Math.min(77,a.y+(e.key==='ArrowDown'?5:e.key==='ArrowUp'?-5:0)))}))}if(e.code==='Space'){e.preventDefault();if(round.status==='ready'||round.status==='finished'){start();return}const target=current.current.ducks.find(d=>Math.abs(d.x-aim.x)<9&&Math.abs(d.y-aim.y)<12);fire(target?.id??null,aim.x,aim.y)}}}
 onPointerDown={e=>{if(e.button!==0)return;const box=e.currentTarget.getBoundingClientRect();const x=(e.clientX-box.left)/box.width*100,y=(e.clientY-box.top)/box.height*100;setAim({x,y});fire(null,x,y)}}>
 <svg className="game-landscape" viewBox="0 0 900 520" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges"><rect width="900" height="520" fill="#8eaa9c"/><rect y="200" width="900" height="170" fill="#b2b49c"/><path d="M0 300h60v-20h100v-30h60v25h100v30h80v-40h80v-40h65v30h80v30h120v-35h65v20h90v250H0z" fill="#5b7663"/><circle cx="730" cy="96" r="35" fill="#e9d8a8"/><path d="M70 80h90v15h35v14H48V95h22zm330 55h70v13h40v13H375v-13h25z" fill="#cbd1b8"/><rect y="370" width="900" height="150" fill="#303f31"/><path d="M0 410h900v20H0zm0 70h900v15H0z" fill="#3f5037"/><path d="M80 370V220h-18v-25h-25v-50h25v-40h40v25h30v70h-30v170z" fill="#253b30"/><path d="M0 370v-25h25v-30h13v30h28v25h30v-18h18v18h645v-25h20v-25h12v25h28v25h30v-45h20v-30h12v30h20v45h49v150H0z" fill="#475834"/><path d="M100 425h100v6H100zm380 30h130v7H480zm240-40h75v6h-75z" fill="#819071"/></svg>
 {round.ducks.map(d=><button key={d.id} className={'duck-target '+(d.direction===-1?'fly-left':'')} style={{left:`${d.x}%`,top:`${d.y}%`}} disabled={round.status!=='playing'} aria-label={`Попасть в утку ${d.id}`} onPointerDown={e=>{e.stopPropagation();if(e.button===0)fire(d.id,d.x,d.y)}} onClick={e=>{if(e.detail===0)fire(d.id,d.x,d.y)}}><Duck id={d.id}/></button>)}
 {round.status==='playing'&&<span className="game-crosshair" style={{left:`${aim.x}%`,top:`${aim.y}%`}}><Crosshair size={26}/></span>}
 {flash&&<span className={'game-shot '+(flash.hit?'hit':'miss')} style={{left:`${flash.x}%`,top:`${flash.y}%`}}>{flash.hit?'+10':'·'}</span>}
 {round.status!=='playing'&&<div className="game-overlay"><span className="eyebrow">ОФК / УТИНАЯ ОХОТА</span><h3>{round.status==='ready'?'Ваш выход, шеф.':round.status==='paused'?'Хорошая пауза.':'Точный почерк.'}</h3><p>{round.status==='ready'?'30 секунд. Летящие утки. Ваша меткость.':round.status==='paused'?'Таймер остановлен. Продолжим, когда будете готовы.':`Ваш результат: ${round.hits*10} очков. Попаданий: ${round.hits} из ${round.shots}. Точность: ${round.shots?Math.round(round.hits/round.shots*100):0}%.`}</p><button className="game-start" onPointerDown={e=>e.stopPropagation()} onClick={()=>round.status==='paused'?resume():start()}>{round.status==='finished'?<RotateCcw size={16}/>:<Play size={16}/>} {round.status==='ready'?'На охоту':round.status==='paused'?'Продолжить':'Ещё один раунд'}</button></div>}
 </div>
 <div className="game-bottom"><span>ТЕЛЕФОН И ПЛАНШЕТ — КАСАНИЕ · КОМПЬЮТЕР — МЫШЬ</span><span>{round.status==='playing'?'ИГРА ИДЁТ':'30 СЕКУНД / ВАШ ЛИЧНЫЙ РЕКОРД'}</span></div>
 <p className="game-accessible" aria-live="polite">{round.status==='finished'?`Раунд завершён. ${round.hits*10} очков.`:round.status==='paused'?'Игра на паузе.':''}</p>
 </section>
}
