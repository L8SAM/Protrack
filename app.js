firebase.initializeApp({
  apiKey: "AIzaSyA5ZCHkx2mTINSJyRMUhZXwNZk7mqrZZLo",
  authDomain: "protrack-d4ab4.firebaseapp.com",
  projectId: "protrack-d4ab4",
  storageBucket: "protrack-d4ab4.firebasestorage.app",
  messagingSenderId: "522219668711",
  appId: "1:522219668711:web:2d132ee2e8ae007bfbce42"
});

const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs:false }).catch(()=>{});

const TARGET = 170;
const USERS = ["Noah","Max"];
let currentUser = "Noah";
let lastEntry = null;

const el = id => document.getElementById(id);

/* HELPERS */
function dateId(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function startOfWeek(d){
  const n=new Date(d); const day=n.getDay()||7;
  n.setDate(n.getDate()-day+1); n.setHours(0,0,0,0); return n;
}
function addDays(d,i){ const n=new Date(d); n.setDate(n.getDate()+i); return n; }
function color(p){ if(p<40)return"red"; if(p<75)return"yellow"; return"green"; }
function haptic(type){
  if(window.navigator.vibrate){
    navigator.vibrate(type==="success"?30:type==="soft"?10:5);
  }
}

/* LOGIN */
el("loginBtn").onclick=()=>el("loginOverlay").style.display="flex";
el("loginOverlay").onclick=e=>{ if(e.target.id==="loginOverlay") el("loginOverlay").style.display="none"; };
el("confirmLogin").onclick=async()=>{
  await auth.signInWithEmailAndPassword(el("email").value,el("password").value);
  el("loginOverlay").style.display="none";
};
el("logoutBtn").onclick=()=>auth.signOut();

auth.onAuthStateChanged(user=>{
  if(user){
    currentUser = user.email.includes("max") ? "Max" : "Noah";
    el("userName").textContent=currentUser;
    el("labelNoah").classList.toggle("active", currentUser==="Noah");
    el("labelMax").classList.toggle("active", currentUser==="Max");
    el("loginBtn").style.display="none";
    el("logoutBtn").style.display="inline";
    el("saveBar").classList.remove("hidden");
    loadToday(); loadWeek(0); loadWeek(-7);
  } else {
    el("userName").textContent="";
    el("saveBar").classList.add("hidden");
  }
});

/* TODAY */
let confettiDone=false;
function loadToday(){
  const id=dateId(new Date());
  db.collection("proteinTracker").doc(id).onSnapshot(s=>{
    const d=s.exists?s.data():{};
    USERS.forEach(u=>{
      const v=d[u]||0;
      const p=Math.round(v/TARGET*100);
      const bar=el(`today${u}`);
      bar.style.width=Math.min(100,p)+"%";
      bar.className="fill "+color(p);
      el(`today${u}Text`).textContent=`${v} g / ${TARGET} g (${p}%)`;

      if(u===currentUser && v>=TARGET && !confettiDone){
        confettiDone=true;
        haptic("success");
        launchConfetti();
      }
    });
  });
}

/* WEEK */
function loadWeek(offset){
  const base=startOfWeek(new Date());
  base.setDate(base.getDate()+offset);
  const target=offset===0?el("weekChart"):el("lastWeekChart");
  target.innerHTML="";
  for(let i=0;i<7;i++){
    const d=addDays(base,i);
    const id=dateId(d);
    const elDay=document.createElement("div");
    elDay.className="week-day";
    if(dateId(new Date())===id) elDay.classList.add("today");
    elDay.innerHTML=`
      ${["Mo","Di","Mi","Do","Fr","Sa","So"][i]}<br>${d.getDate()}.${d.getMonth()+1}
      <div class="week-bar"><div class="week-fill noah" id="w-${id}-Noah"></div></div>
      <div class="week-bar"><div class="week-fill max" id="w-${id}-Max"></div></div>
    `;
    target.appendChild(elDay);
    setTimeout(()=>{
      db.collection("proteinTracker").doc(id).onSnapshot(s=>{
        const data=s.exists?s.data():{};
        USERS.forEach(u=>{
          const v=data[u]||0;
          const p=Math.min(100,v/TARGET*100);
          const b=el(`w-${id}-${u}`);
          if(b) b.style.width=p+"%";
        });
      });
    }, i*60);
  }
}

/* SAVE + UNDO */
el("saveBtn").onclick=async()=>{
  const input=el("proteinInput");
  const v=Number(input.value);
  if(!v||v<0||v>300)return;
  const d=dateId(new Date());
  lastEntry={user:currentUser,value:v,date:d};
  await db.collection("proteinTracker").doc(d)
    .set({[currentUser]:firebase.firestore.FieldValue.increment(v)},{merge:true});
  input.value="";
  input.classList.add("flash");
  setTimeout(()=>input.classList.remove("flash"),400);
  el("undoBtn").style.opacity=1;
  haptic("soft");
  setTimeout(()=>el("undoBtn").style.opacity=.3,7000);
};

el("undoBtn").onclick=async()=>{
  if(!lastEntry)return;
  await db.collection("proteinTracker").doc(lastEntry.date)
    .set({[lastEntry.user]:firebase.firestore.FieldValue.increment(-lastEntry.value)},{merge:true});
  lastEntry=null;
  haptic("light");
};

/* CONFETTI */
function launchConfetti(){
  const c=el("confetti"),ctx=c.getContext("2d");
  c.width=innerWidth;c.height=innerHeight;
  const pieces=[...Array(120)].map(()=>({
    x:Math.random()*c.width,
    y:Math.random()*-c.height,
    r:Math.random()*6+4,
    c:`hsl(${Math.random()*360},100%,60%)`,
    v:Math.random()*3+2
  }));
  let t=0;
  (function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    pieces.forEach(p=>{
      p.y+=p.v;
      ctx.beginPath();
      ctx.fillStyle=p.c;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    if(t++<120) requestAnimationFrame(draw);
  })();
}
