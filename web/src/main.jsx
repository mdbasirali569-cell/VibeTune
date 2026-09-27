import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{Home,Search,Library,Heart,Play,Pause,SkipBack,SkipForward,MoreHorizontal,Volume2,Shuffle,Repeat2,Menu,LoaderCircle,Music2}from'lucide-react';
import'./style.css';

const FALLBACK=[
{id:'local-1',name:'Midnight Drive',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:214000},
{id:'local-2',name:'Neon Dreams',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:198000},
{id:'local-3',name:'Afterglow',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:221000},
{id:'local-4',name:'Ocean Eyes',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:203000},
{id:'local-5',name:'City Lights',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:187000},
{id:'local-6',name:'Slow Motion',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:232000}
];

function App(){
const[playing,setPlaying]=useState(false);
const[active,setActive]=useState('Home');
const[current,setCurrent]=useState(0);
const[query,setQuery]=useState('');
const[results,setResults]=useState(FALLBACK);
const[loading,setLoading]=useState(false);
const[error,setError]=useState('');
const t=results[current]||FALLBACK[0];

useEffect(()=>{
const q=query.trim();
if(!q){setResults(FALLBACK);setCurrent(0);setError('');return;}
const controller=new AbortController();
const timer=setTimeout(async()=>{
setLoading(true);setError('');
try{
const res=await fetch('https://itunes.apple.com/search?term='+encodeURIComponent(q)+'&media=music&entity=song&limit=24',{signal:controller.signal});
if(!res.ok)throw new Error('Search request failed');
const data=await res.json();
setResults(data.results&&data.results.length?data.results:FALLBACK);setCurrent(0);
}catch(e){if(e.name!=='AbortError'){setResults([]);setError('Online catalogue could not be reached. Try again.');}}
finally{if(!controller.signal.aborted)setLoading(false);}
},350);
return()=>{clearTimeout(timer);controller.abort();};
},[query]);

const visible=useMemo(()=>results.slice(0,12),[results]);
const selectTrack=item=>{const idx=results.indexOf(item);setCurrent(idx>=0?idx:0);setPlaying(true);};
const go=page=>{setActive(page);if(page==='Search')setTimeout(()=>document.querySelector('.search input')?.focus(),0);};

return <div className="app">
<aside><div className="logo"><span>V</span> VibeTune</div><nav>
<button className={active==='Home'?'active':''} onClick={()=>go('Home')}><Home/>Home</button>
<button className={active==='Search'?'active':''} onClick={()=>go('Search')}><Search/>Search</button>
<button className={active==='Library'?'active':''} onClick={()=>go('Library')}><Library/>Your Library</button>
</nav><div className="sideBottom"><button><Heart/>Liked Songs</button><div className="upgrade">Premium<br/><small>Unlock the full experience</small><b>Upgrade</b></div></div></aside>

<main><header><button className="mobileMenu"><Menu/></button><div className="search"><Search/><input value={query} onChange={e=>{setQuery(e.target.value);setActive('Search')}} placeholder="Search songs, artists, albums..."/></div><button className="avatar">VT</button></header>

{active==='Home'&&<section className="hero"><div><p className="eyebrow">YOUR MUSIC. YOUR VIBE.</p><h1>Music that moves<br/><em>with you.</em></h1><p className="sub">Discover songs, artists and albums from the online music catalogue.</p><button className="primary" onClick={()=>go('Search')}><Search/>Explore music</button></div><div className="orb"><div className="orbInner">♫</div></div></section>}

{active==='Search'?<section className="section"><div className="sectionHead"><h2>{query?'Online catalogue':'Search music'}</h2><span>{loading?'Searching...':visible.length+' results'}</span></div>
{loading?<div className="empty"><LoaderCircle className="spin"/><span>Finding songs...</span></div>:error?<div className="empty"><span>{error}</span></div>:!query?<div className="empty"><Music2/><span>Search for a song, artist or album</span></div>:<div className="trackList">{visible.map(x=><Track key={x.trackId||x.collectionId||x.id} x={x} onPlay={()=>selectTrack(x)} active={t===x&&playing}/>)}</div>}</section>:
active==='Library'?<section className="section"><div className="sectionHead"><h2>Your Library</h2><span>Local VibeTune picks</span></div><div className="cards">{FALLBACK.slice(0,4).map((x,i)=><Card key={x.id} x={x} onPlay={()=>{setResults(FALLBACK);setCurrent(i);setPlaying(true)}} playing={t.name===x.name&&playing}/>)}</div></section>:
<><section className="section"><div className="sectionHead"><h2>Trending now</h2><span>Online catalogue</span></div><div className="cards">{FALLBACK.slice(0,4).map((x,i)=><Card key={x.id} x={x} onPlay={()=>{setResults(FALLBACK);setCurrent(i);setPlaying(true)}} playing={t.name===x.name&&playing}/>)}</div></section>
<section className="section"><div className="sectionHead"><h2>Made for you</h2><span>Fresh picks</span></div><div className="wideGrid">{FALLBACK.slice(2).map((x,i)=><Track key={x.id} x={x} onPlay={()=>{setResults(FALLBACK);setCurrent(i+2);setPlaying(true)}} active={t.name===x.name&&playing}/>)}</div></section></>}</main>

<div className="mini"><div className="now"><Artwork x={t}/><div><b>{t.trackName||t.name}</b><small>{t.artistName}</small></div></div><div className="controls"><button><Shuffle/></button><button onClick={()=>setCurrent(c=>(c-1+results.length)%results.length)}><SkipBack/></button><button className="play" onClick={()=>setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</button><button onClick={()=>{setCurrent(c=>(c+1)%results.length);setPlaying(true)}}><SkipForward/></button><button><Repeat2/></button></div><div className="vol"><Volume2/><div className="bar"><i/></div></div></div>
<div className="mobileNav"><button onClick={()=>go('Home')}><Home/><span>Home</span></button><button onClick={()=>go('Search')}><Search/><span>Search</span></button><button onClick={()=>go('Library')}><Library/><span>Library</span></button></div></div>
}

function Artwork({x}){const url=x?.artworkUrl100?.replace('100x100','300x300');return <div className="cover small" style={url?{backgroundImage:'url("'+url+'")'}:undefined}>{!url&&<span>{(x?.trackName||x?.name||'VT').slice(0,2).toUpperCase()}</span>}</div>}
function Card({x,onPlay,playing}){return <article className="card"><div className="art">{x.artworkUrl100?<img src={x.artworkUrl100.replace('100x100','400x400')} alt="" loading="lazy"/>:<span>{x.name.slice(0,2).toUpperCase()}</span>}<button onClick={onPlay}>{playing?<Pause/>:<Play/>}</button></div><b>{x.trackName||x.name}</b><small>{x.artistName}</small></article>}
function Track({x,onPlay,active}){return <div className="track"><Artwork x={x}/><div className="trackInfo"><b>{x.trackName||x.name}</b><small>{x.artistName}{x.collectionName?' • '+x.collectionName:''}</small></div><button onClick={onPlay} className="round">{active?<Pause/>:<Play/>}</button><MoreHorizontal/></div>}
createRoot(document.getElementById('root')).render(<App/>);