import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{Home,Search,Library,Heart,Play,Pause,SkipBack,SkipForward,MoreHorizontal,Volume2,Shuffle,Repeat2,Menu,LoaderCircle,Music2,X,Plus,Trash2,Clock3,Mic2,UserCircle,ChevronDown,ExternalLink,Check,LogOut}from'lucide-react';
import'./style.css';

const FALLBACK=[
{id:'local-1',name:'Midnight Drive',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:214000},
{id:'local-2',name:'Neon Dreams',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:198000},
{id:'local-3',name:'Afterglow',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:221000},
{id:'local-4',name:'Ocean Eyes',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:203000},
{id:'local-5',name:'City Lights',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:187000},
{id:'local-6',name:'Slow Motion',artistName:'VibeTune Originals',collectionName:'VibeTune Sessions',artworkUrl100:'',trackTimeMillis:232000}
];

const STORE={likes:'vibetune_likes',history:'vibetune_history',playlists:'vibetune_playlists',profile:'vibetune_profile'};
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const idOf=x=>String(x?.trackId||x?.id||x?.collectionId||x?.trackName||x?.name||'unknown');
const titleOf=x=>x?.trackName||x?.name||'Unknown track';
const artistOf=x=>x?.artistName||x?.artist||'Unknown artist';
const artOf=x=>x?.artworkUrl100?.replace('100x100','600x600')||x?.artworkUrl100?.replace('100x100','400x400')||'';

function App(){
const[page,setPage]=useState('Home'),[query,setQuery]=useState(''),[results,setResults]=useState(FALLBACK),[loading,setLoading]=useState(false),[error,setError]=useState(''),[current,setCurrent]=useState(0),[playing,setPlaying]=useState(false),[likes,setLikes]=useState(()=>read(STORE.likes,[])),[history,setHistory]=useState(()=>read(STORE.history,[])),[playlists,setPlaylists]=useState(()=>read(STORE.playlists,[])),[profile,setProfile]=useState(()=>read(STORE.profile,{name:'VibeTune User',email:''})),[showPlayer,setShowPlayer]=useState(false),[showQueue,setShowQueue]=useState(false),[showLyrics,setShowLyrics]=useState(false),[volume,setVolume]=useState(0.8),[shuffle,setShuffle]=useState(false),[repeat,setRepeat]=useState(false),[notice,setNotice]=useState('');
const audio=useRef(null),t=results[current]||FALLBACK[0],src=t?.previewUrl||'';

useEffect(()=>write(STORE.likes,likes),[likes]);useEffect(()=>write(STORE.history,history.slice(0,30)),[history]);useEffect(()=>write(STORE.playlists,playlists),[playlists]);useEffect(()=>write(STORE.profile,profile),[profile]);
useEffect(()=>{if(!notice)return;const z=setTimeout(()=>setNotice(''),2200);return()=>clearTimeout(z)},[notice]);
useEffect(()=>{if(!query.trim()){setResults(FALLBACK);setCurrent(0);setError('');return}const c=new AbortController(),timer=setTimeout(async()=>{setLoading(true);setError('');try{const r=await fetch('https://itunes.apple.com/search?term='+encodeURIComponent(query.trim())+'&country=US&media=music&entity=song&limit=24',{signal:c.signal});if(!r.ok)throw Error('request');const d=await r.json();setResults(d.results?.length?d.results:[]);setCurrent(0)}catch(e){if(e.name!=='AbortError'){setResults([]);setError('Online catalogue could not be reached. Check your connection and try again.')}}finally{if(!c.signal.aborted)setLoading(false)}},350);return()=>{clearTimeout(timer);c.abort()}},[query]);

useEffect(()=>{if(audio.current)audio.current.volume=volume},[volume]);
useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('.search input')?.focus()}if(e.code==='Space'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();togglePlay()}if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[current,results,playing,shuffle,repeat,src]);

const visible=useMemo(()=>results.slice(0,12),[results]);
const liked=id=>likes.some(x=>idOf(x)===idOf(t));
const pushHistory=x=>setHistory(h=>[x,...h.filter(y=>idOf(y)!==idOf(x))].slice(0,30));
const select=x=>{const i=results.findIndex(y=>idOf(y)===idOf(x));if(i>=0)setCurrent(i);setPlaying(Boolean(x.previewUrl));setShowPlayer(true);pushHistory(x)};
const togglePlay=()=>{if(!src){setNotice('No playable preview for this track');setPlaying(false);return}setPlaying(v=>!v);setShowPlayer(true)};
useEffect(()=>{const a=audio.current;if(!a)return; if(playing&&src)a.play().catch(()=>{setPlaying(false);setNotice('Playback was blocked. Tap play again.')});else a.pause()},[playing,src]);
const next=()=>{if(!results.length)return;let i;if(shuffle)i=Math.floor(Math.random()*results.length);else i=(current+1)%results.length;setCurrent(i);setPlaying(Boolean(results[i]?.previewUrl));pushHistory(results[i])};
const prev=()=>{if(!results.length)return;const i=(current-1+results.length)%results.length;setCurrent(i);setPlaying(Boolean(results[i]?.previewUrl));pushHistory(results[i])};
const ended=()=>{if(repeat){if(audio.current){audio.current.currentTime=0;audio.current.play().catch(()=>{})}}else next()};
const toggleLike=()=>{setLikes(l=>l.some(x=>idOf(x)===idOf(t))?l.filter(x=>idOf(x)!==idOf(t)):[t,...l])};
const createPlaylist=()=>{const name=window.prompt('Playlist name');if(!name?.trim())return;setPlaylists(p=>[...p,{id:Date.now(),name:name.trim(),tracks:[t]}]);setNotice('Playlist created')};
const addToPlaylist=p=>{setPlaylists(list=>list.map(x=>x.id===p.id?{...x,tracks:x.tracks.some(y=>idOf(y)===idOf(t))?x.tracks:[...x.tracks,t]}:x));setNotice('Added to '+p.name)};
const go=p=>{setPage(p);if(p==='Search')setTimeout(()=>document.querySelector('.search input')?.focus(),0)};

return <div className="app">
<aside><div className="logo"><span>V</span> VibeTune</div><nav>
<Nav active={page==='Home'} onClick={()=>go('Home')} icon={<Home/>}>Home</Nav><Nav active={page==='Search'} onClick={()=>go('Search')} icon={<Search/>}>Search</Nav><Nav active={page==='Library'} onClick={()=>go('Library')} icon={<Library/>}>Your Library</Nav><Nav active={page==='Liked'} onClick={()=>go('Liked')} icon={<Heart/>}>Liked Songs</Nav><Nav active={page==='History'} onClick={()=>go('History')} icon={<Clock3/>}>History</Nav><Nav active={page==='Playlists'} onClick={()=>go('Playlists')} icon={<Music2/>}>Playlists</Nav><Nav active={page==='Lyrics'} onClick={()=>setShowLyrics(true)} icon={<Mic2/>}>Lyrics</Nav>
</nav><div className="sideBottom"><div className="upgrade">Premium<br/><small>Unlock the full experience</small><b>Coming soon</b></div></div></aside>

<main><header><button className="mobileMenu" onClick={()=>go('Home')}><Menu/></button><div className="search"><Search/><input value={query} onChange={e=>{setQuery(e.target.value);setPage('Search')}} placeholder="Search songs, artists, albums..."/><kbd>Ctrl K</kbd></div><button className="avatar" onClick={()=>go('Profile')}>{profile.name.slice(0,2).toUpperCase()}</button></header>

{page==='Home'&&<><section className="hero"><div><p className="eyebrow">YOUR MUSIC. YOUR VIBE.</p><h1>Music that moves<br/><em>with you.</em></h1><p className="sub">Search a live music catalogue, preview tracks, save favourites and build your own library.</p><button className="primary" onClick={()=>go('Search')}><Search/>Explore music</button></div><div className="orb"><div className="orbInner">♫</div></div></section><Section title="Trending now" meta="Online catalogue"><div className="cards">{FALLBACK.slice(0,4).map((x,i)=><Card key={idOf(x)} x={x} onPlay={()=>select(x)} playing={titleOf(t)===titleOf(x)&&playing}/>)}</div></Section><Section title="Recently played" meta={history.length+' tracks'}><div className="wideGrid">{(history.length?history:FALLBACK.slice(2)).slice(0,5).map(x=><Track key={idOf(x)} x={x} onPlay={()=>select(x)} active={idOf(t)===idOf(x)&&playing}/>)}</div></Section></>}

{page==='Search'&&<Section title={query?'Online catalogue':'Search music'} meta={loading?'Searching...':query?visible.length+' results':'Ready'}>{loading?<Empty><LoaderCircle className="spin"/>Finding songs...</Empty>:error?<Empty>{error}</Empty>:!query?<Empty><Music2/>Search for a song, artist or album</Empty>:!visible.length?<Empty>No songs found. Try another search.</Empty>:<div className="trackList">{visible.map(x=><Track key={idOf(x)} x={x} onPlay={()=>select(x)} active={idOf(t)===idOf(x)&&playing} like={likes.some(y=>idOf(y)===idOf(x))}/>)}</div>}</Section>}

{page==='Library'&&<Section title="Your Library" meta={likes.length+' liked'}>{likes.length?<div className="cards">{likes.slice(0,12).map(x=><Card key={idOf(x)} x={x} onPlay={()=>{setResults(likes);select(x)}} playing={idOf(t)===idOf(x)&&playing}/>)}</div>:<Empty><Heart/>Like songs to see them here.</Empty>}</Section>}

{page==='Liked'&&<Section title="Liked Songs" meta={likes.length+' saved'}>{likes.length?<div className="trackList">{likes.map(x=><Track key={idOf(x)} x={x} onPlay={()=>{setResults(likes);select(x)}} active={idOf(t)===idOf(x)&&playing}/>)}</div>:<Empty><Heart/>Your liked songs will appear here.</Empty>}</Section>}

{page==='History'&&<Section title="Listening history" meta={history.length+' tracks'}>{history.length?<div className="trackList">{history.map(x=><Track key={idOf(x)} x={x} onPlay={()=>{setResults(history);select(x)}} active={idOf(t)===idOf(x)&&playing}/>)}</div>:<Empty><Clock3/>Nothing played yet.</Empty>}</Section>}

{page==='Playlists'&&<Section title="Playlists" meta={playlists.length+' playlists'}><div className="playlistBar"><button className="primary" onClick={createPlaylist}><Plus/>New playlist</button></div>{playlists.length?<div className="playlistGrid">{playlists.map(p=><article className="playlist" key={p.id}><div className="playlistArt"><Music2/></div><div><b>{p.name}</b><small>{p.tracks.length} tracks</small></div><button title="Add current track" onClick={()=>addToPlaylist(p)}><Plus/></button></article>)}</div>:<Empty><Music2/>Create a playlist and add songs from the player.</Empty>}</Section>}

{page==='Profile'&&<Section title="Profile" meta="Stored on this device"><div className="profile"><UserCircle size={48}/><label>Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><div className="profileNote"><Check/>Local profile is ready. Cloud account sync can be connected later.</div><button className="ghost" onClick={()=>{localStorage.clear();location.reload()}}><LogOut/>Reset local data</button></div></Section>}

<audio ref={audio} src={src||undefined} onEnded={ended} onError={()=>{setPlaying(false);setNotice('This preview is unavailable.')}} preload="metadata"/>
<div className="mini" onClick={()=>setShowPlayer(true)}><div className="now"><Artwork x={t}/><div><b>{titleOf(t)}</b><small>{artistOf(t)}</small></div></div><div className="controls" onClick={e=>e.stopPropagation()}><button className={shuffle?'selected':''} onClick={()=>setShuffle(v=>!v)}><Shuffle/></button><button onClick={prev}><SkipBack/></button><button className="play" onClick={togglePlay}>{playing?<Pause/>:<Play/>}</button><button onClick={next}><SkipForward/></button><button className={repeat?'selected':''} onClick={()=>setRepeat(v=>!v)}><Repeat2/></button></div><div className="vol" onClick={e=>e.stopPropagation()}><Volume2/><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></div></div>
<div className="mobileNav"><Nav active={page==='Home'} onClick={()=>go('Home')} icon={<Home/>}>Home</Nav><Nav active={page==='Search'} onClick={()=>go('Search')} icon={<Search/>}>Search</Nav><Nav active={page==='Library'} onClick={()=>go('Library')} icon={<Library/>}>Library</Nav><Nav active={page==='Liked'} onClick={()=>go('Liked')} icon={<Heart/>}>Liked</Nav></div>
</main>

{showPlayer&&<div className="modal playerModal" onClick={()=>setShowPlayer(false)}><div className="playerSheet" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setShowPlayer(false)}><X/></button><Artwork x={t} large/><p className="eyebrow">NOW PLAYING</p><h2>{titleOf(t)}</h2><p className="muted">{artistOf(t)} • {t.collectionName||'Single'}</p><div className="progress"><span>Preview</span><span>30 sec max</span></div><div className="bigControls"><button onClick={prev}><SkipBack/></button><button className="bigPlay" onClick={togglePlay}>{playing?<Pause/>:<Play/>}</button><button onClick={next}><SkipForward/></button></div><div className="playerActions"><button className={liked?'liked':''} onClick={toggleLike}><Heart/> {liked?'Liked':'Like'}</button><button onClick={()=>setShowLyrics(true)}><Mic2/> Lyrics</button><button onClick={createPlaylist}><Plus/> Playlist</button><button onClick={()=>setShowQueue(v=>!v)}><MoreHorizontal/> More</button></div>{showQueue&&<div className="queueBox"><b>Queue</b><small>Current catalogue queue: {results.length} tracks</small>{playlists.length>0&&playlists.slice(0,3).map(p=><button key={p.id} onClick={()=>addToPlaylist(p)}>Add to {p.name}</button>)}</div>}<p className="attribution">Preview and artwork provided courtesy of iTunes. <a href={t.trackViewUrl||'#'} target="_blank" rel="noreferrer">View in store <ExternalLink/></a></p></div></div>}

{showLyrics&&<div className="modal" onClick={()=>setShowLyrics(false)}><div className="lyrics" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setShowLyrics(false)}><X/></button><Mic2/><p className="eyebrow">LYRICS</p><h2>{titleOf(t)}</h2><p className="muted">{artistOf(t)}</p><div className="lyricsText">Lyrics are not supplied by the catalogue API for this track.<br/><br/>Use lyrics from a source you have permission to display, or connect a licensed lyrics provider in a future VibeTune release.</div></div></div>}
{notice&&<div className="toast">{notice}</div>}
</div>
}

function Nav({active,onClick,icon,children}){return <button className={active?'active':''} onClick={onClick}>{icon}<span>{children}</span></button>}
function Section({title,meta,children}){return <section className="section"><div className="sectionHead"><h2>{title}</h2><span>{meta}</span></div>{children}</section>}
function Empty({children}){return <div className="empty">{children}</div>}
function Artwork({x,large=false}){const url=artOf(x);return <div className={'cover '+(large?'large':'small')} style={url?{backgroundImage:'url("'+url+'")'}:undefined}>{!url&&<span>{titleOf(x).slice(0,2).toUpperCase()}</span>}</div>}
function Card({x,onPlay,playing}){return <article className="card"><div className="art">{artOf(x)?<img src={artOf(x)} alt="" loading="lazy"/>:<span>{titleOf(x).slice(0,2).toUpperCase()}</span>}<button onClick={onPlay}>{playing?<Pause/>:<Play/>}</button></div><b>{titleOf(x)}</b><small>{artistOf(x)}</small></article>}
function Track({x,onPlay,active}){return <div className="track"><Artwork x={x}/><div className="trackInfo"><b>{titleOf(x)}</b><small>{artistOf(x)}{x.collectionName?' • '+x.collectionName:''}</small></div><button onClick={onPlay} className="round">{active?<Pause/>:<Play/>}</button><MoreHorizontal/></div>}
createRoot(document.getElementById('root')).render(<App/>);