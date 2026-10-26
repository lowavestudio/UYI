import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Volume2, VolumeX, X, Menu, Wine, RotateCcw, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { DuckHunt } from './components/DuckHunt'
import { articles, departments } from './editorial'
const pages = ['Обложка', 'Характер', 'Выдержка', 'Лидерство', 'Слово команде', 'За Вас!']
const info = [
 {rubric:'SPORT & CHARACTER', kicker:'01 / Хоккейное наследие',title:<>Ледяное<br/><em>спокойствие.</em></>, sub:'Скорость, дисциплина и умение видеть площадку на три шага вперёд.',image:'hockey-editorial.webp',caption:'Характер, который проявляется в игре',quote:'Точность. Характер. Команда.',note:'На льду и за его пределами'},
 {rubric:'THE ART OF PATIENCE', kicker:'02 / Охотничья стихия',title:<>Искусство<br/><em>выдержки.</em></>,sub:'Утренний туман, тишина и умение выбрать свой момент.',image:'forest-editorial.webp',caption:'Там, где тишина становится роскошью',quote:'Умение ждать. Смелость действовать.',note:'Свой ритм. Своя высота.'},
 {rubric:'PEOPLE & BUSINESS',kicker:'03 / Человек за брендом',title:<>Создавать.<br/><em>Вдохновлять.</em></>,sub:'Юрий Иванович Усовик. Личный стиль руководителя и сила большой команды.',image:'editorial-full.webp',caption:'Юрий Иванович Усовик / ОФК',quote:'Уважение. Гордость. Команда.',note:'Озёрская фурнитурная компания'}
]
export default function App(){
 const [page,setPage]=useState(0),[menu,setMenu]=useState(false),[playing,setPlaying]=useState(false),[toasts,setToasts]=useState(0),[share,setShare]=useState('Поделиться')
 const audio=useRef<HTMLAudioElement>(null); const touch=useRef({x:0,y:0})
 function navigate(n:number){
  if(n<0||n>5)return
  setPage(n)
  setMenu(false)
  window.scrollTo({top:0,behavior:'instant'})
  if(audio.current&&audio.current.paused){
    audio.current.volume=.4
    audio.current.play().then(()=>setPlaying(true)).catch(()=>{})
  }
 }
 useEffect(()=>{
  const playAudio=()=>{
    if(audio.current&&audio.current.paused){
      audio.current.volume=.4
      audio.current.play().then(()=>setPlaying(true)).catch(()=>{
        const onFirst=()=>{
          if(audio.current&&audio.current.paused){
            audio.current.volume=.4
            audio.current.play().then(()=>setPlaying(true)).catch(()=>{})
          }
        }
        window.addEventListener('click',onFirst,{once:true})
        window.addEventListener('touchstart',onFirst,{once:true})
        window.addEventListener('keydown',onFirst,{once:true})
      })
    }
  }
  playAudio()
 },[])
 useEffect(()=>{const f=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('input,textarea,select,[data-game]'))return;if(e.key==='ArrowRight')navigate(page+1);if(e.key==='ArrowLeft')navigate(page-1);if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[page])
 async function music(){if(!audio.current)return;if(playing){audio.current.pause();setPlaying(false)}else{try{audio.current.volume=.4;await audio.current.play();setPlaying(true)}catch{setPlaying(false)}}}
 function toast(){setToasts(n=>n+1);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)confetti({particleCount:100,spread:85,colors:['#ba9a60','#e8d6b1','#ffffff'],origin:{y:.65}})}
 async function sharing(){try{await navigator.clipboard.writeText(location.href);setShare('Ссылка скопирована')}catch{setShare('Ссылка: '+location.href)}}
 return <div className="magazine-app">
 <audio ref={audio} src="./audio/usovik-theme.mp3" loop preload="auto" autoPlay/>
 <header className="site-header"><button className="wordmark" onClick={()=>navigate(0)} aria-label="На обложку">USOVIK<span>THE SPECIAL ISSUE</span></button><div className="header-edition">ЛИЧНОСТЬ. ХАРАКТЕР. СТИЛЬ.<span>27 ОКТЯБРЯ · ОФК</span></div><div className="header-actions"><button className={'icon-button '+(playing?'playing':'')} onClick={music} aria-label={playing?'Выключить музыку':'Включить музыку'}>{playing?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button className="contents-button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label="Содержание">{menu?<X size={18}/>:<Menu size={18}/>}<span>Содержание</span></button></div></header>
 {menu&&<nav className="contents"><div className="contents-label">В ЭТОМ НОМЕРЕ</div>{pages.map((p,i)=><button key={p} onClick={()=>navigate(i)} aria-current={i===page?'page':undefined}><span>0{i+1}</span>{p}<ArrowRight size={18}/></button>)}</nav>}
 <main onTouchStart={e=>{if((e.target as HTMLElement).closest('[data-game]'))return;touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if((e.target as HTMLElement).closest('[data-game]'))return;const dx=touch.current.x-e.changedTouches[0].clientX,dy=touch.current.y-e.changedTouches[0].clientY;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)navigate(page+(dx>0?1:-1))}}>
 {page===0?<section className="cover-stage page-enter" key="cover"><div className="cover-aside"><span className="eyebrow">КОЛЛЕКЦИОННЫЙ ВЫПУСК</span><h1>Человек.<br/>Характер.<br/><em>Легенда.</em></h1><div className="fine-rule"/><p>Посвящается Юрию Ивановичу Усовику.<br/>С уважением и благодарностью — команда ОФК.</p><button className="text-link" onClick={()=>navigate(1)}>Открыть этот номер <ArrowRight size={20}/></button><span className="edition-date">ЕДИНСТВЕННЫЙ В СВОЁМ РОДЕ · 27.10</span></div><button className="cover-art" onClick={()=>navigate(1)} aria-label="Открыть журнал"><img src="./assets/magazine-cover.jpg" alt="USOVIK. Юрий Иванович. Праздничная обложка"/><span>ЛИСТАТЬ НОМЕР <ArrowRight size={15}/></span></button><span className="vertical-note">A TRIBUTE TO A MAN OF CHARACTER</span></section>:null}
 {page>=1&&page<=3&&(()=>{const d=info[page-1];return <article key={page} className={'editorial page-enter editorial-'+page}><div className="running-header"><span>USOVIK <b>/</b> SPECIAL EDITION</span><span>{d.rubric}</span><span>0{page+1}</span></div><div className="feature-top"><div className="feature-heading"><span className="eyebrow">{d.kicker}</span><h1>{d.title}</h1><p className="standfirst">{d.sub}</p>{page===2&&<button className="hunt-game-link" onClick={()=>document.getElementById('duck-hunt')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>Испытать меткость <ArrowRight size={15}/></button>}<span className="feature-byline">СПЕЦИАЛЬНЫЙ МАТЕРИАЛ ОФК <span>—</span> 27 ОКТЯБРЯ</span></div><figure className="feature-photo"><img src={'./assets/'+d.image} alt={page===1?'Клюшка и шайба на льду тёмной хоккейной арены':page===2?'Туман над лесным озером на рассвете':'Портрет Юрия Ивановича Усовика'}/><figcaption>{d.caption}</figcaption></figure></div><div className="editorial-body"><aside className="pullquote"><span className="quote-mark">“</span><h2>{d.quote}</h2><span className="eyebrow">{d.note}</span>{page===3&&<img className="brand-logo" src="./assets/ofk-logo.webp" alt="Озёрская фурнитурная компания"/>}</aside><div className="story-columns">{articles[page-1].map((p,i)=><p className={i===0?'lead-paragraph':''} key={i}>{p}</p>)}</div></div>{page===2&&<DuckHunt/>}<div className="page-colophon"><span>THE MAN. THE STYLE. THE LEGEND.</span><span>USOVIK — 0{page+1}</span></div></article>})()}
 {page===4&&<article key="greetings" className="editorial greetings-page page-enter"><div className="running-header"><span>USOVIK <b>/</b> SPECIAL EDITION</span><span>LETTERS TO THE EDITOR</span><span>05</span></div><div className="greetings-intro"><div><span className="eyebrow">04 / Слово команде</span><h1>С уважением.<br/><em>От всей души.</em></h1></div><div className="greetings-dedication"><span>ЮРИЮ ИВАНОВИЧУ</span><p>За каждым большим делом стоят люди. Сегодня их слова — для Вас.</p><span className="handwritten">С днём рождения!</span></div></div><div className="letters">{departments.map((d,i)=><section className="letter" key={d.dept}><span className="letter-index">0{i+1}</span><div><span className="eyebrow">{d.badge}</span><h2>{d.dept}</h2><h3>{d.lead}</h3><p>{d.text}</p><span className="letter-from">— {d.from}</span></div></section>)}</div><div className="closing-line">Уважение. Гордость. <em>Команда.</em></div><div className="page-colophon"><span>ОЗЁРСКАЯ ФУРНИТУРНАЯ КОМПАНИЯ</span><span>USOVIK — 05</span></div></article>}
 {page===5&&<article key="finale" className="editorial finale-page page-enter"><div className="running-header"><span>USOVIK <b>/</b> SPECIAL EDITION</span><span>THE CELEBRATION</span><span>06</span></div><div className="finale-layout"><div className="finale-art"><img src="./assets/gold-scorpion-3d.jpg" alt="Золотой скорпион — символ характера"/><span>THE SCORPIO EDITION</span></div><div className="finale-copy"><span className="eyebrow">27 октября / Ваш день</span><h1>За Вас,<br/><em>Юрий<br/>Иванович.</em></h1><p className="standfirst">За силу характера. За верность своему слову. За новые главы большой истории.</p><p className="finale-wish">Здоровья, вдохновения и счастливых дней рядом с близкими. Пусть впереди будет ещё больше поводов для гордости и радости.</p><button className="toast-button" onClick={toast}><Wine size={19}/> {toasts?'Ещё один — за Вас!':'Поднять бокал'}<ArrowRight size={19}/></button><p className="toast-status" aria-live="polite">{toasts>0?`Бокалов поднято: ${toasts}. С днём рождения!`:'С уважением — Ваша команда ОФК'}</p><div className="finale-actions"><button onClick={()=>navigate(0)}><RotateCcw size={14}/>Перечитать</button><button onClick={sharing}><Share2 size={14}/>{share}</button></div></div></div><div className="page-colophon"><span>ПРОДОЛЖЕНИЕ СЛЕДУЕТ</span><span>THE BEST IS YET TO COME.</span></div></article>}
 </main><footer className="reader-nav"><button onClick={()=>navigate(page-1)} disabled={page===0} aria-label="Предыдущая страница"><ArrowLeft size={18}/><span>Назад</span></button><nav aria-label="Страницы журнала">{pages.map((p,i)=><button key={p} className={i===page?'active':''} onClick={()=>navigate(i)} aria-label={p} aria-current={i===page?'page':undefined}><span className="page-number">0{i+1}</span><span className="page-name">{p}</span></button>)}</nav><button onClick={()=>navigate(page+1)} disabled={page===5} aria-label="Следующая страница"><span>Далее</span><ArrowRight size={18}/></button></footer></div>
}
