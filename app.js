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

/* 🔐 UID → Name */
const USER_MAP = {
  "PcLivG8sbxfUbfWg5asXy4EPLrm2": "Max",
  "YUq3GKGF1aWih8Yp3bIIf740NVD2": "Noah"
};

const USERS = ["Noah","Max"];

let currentUID = null;
let currentUser = null;

/* 🟢 ACTIVE DAY (v1.3) */
let activeDate = dateId(new Date());

/* 🔁 UNDO */
let undoEntry = null;
let undoTimer = null;

const el = id => document.getElementById(id);

/* HELPERS */
function dateId(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function startOfWeek(d){
  const n=new Date(d); const day=n.getDay()||7;
  n.setDate(n.getDate()-day+1); n.setHours(0,0,0,0); return n;
}
function addDays(d,i){
  const n=new Date(d);
  n.setDate(n.getDate()+i);
  return n;
}
function color(p){
  if(p<40)return"red";
  if(p<75)return"yellow";
  return"green";
}
function haptic(type){
  if(window.navigator.vibrate){
    navigator.vibrate(type==="success"?30:type==="soft"?10:5);
  }
}

/* LOGIN UI */
el("loginBtn").onclick=()=>{
  document.body.classList.add("modal-open");
  el("loginOverlay").style.display="flex";
};

el("loginOverlay").onclick=e=>{
  if(e.target.id==="loginOverlay"){
    document.body.classList.remove("modal-open");
    el("loginOverlay").style.display="none";
  }
};

el("confirmLogin").onclick=async()=>{
  await auth.signInWithEmailAndPassword(
    el("email").value,
    el("password").value
  );
  document.body.classList.remove("modal-open");
  el("loginOverlay").style.display="none";
};

el("logoutBtn").onclick=()=>auth.signOut();

/* AUTH */
auth.onAuthStateChanged(user=>{
  if(user){
    currentUID = user.uid;
    currentUser = USER_MAP[currentUID] || "Unknown";

    activeDate = dateId(new Date()); // reset auf heute

    el("userName").textContent = currentUser;
    el("labelNoah").classList.toggle("active", currentUser==="Noah");
    el("labelMax").classList.toggle("active", currentUser==="Max");

    el("loginBtn").style.display="none";
    el("logoutBtn").style.display="inline";
    el("saveBar").classList.remove("hidden");

    loadToday();
    loadWeek(0);
    loadWeek(-7);
  } else {
    currentUID = null;
    currentUser = null;
    el("userName").textContent="";
    el("loginBtn").style.display="inline";
    el("logoutBtn").style.display="none";
    el("saveBar").classList.add("hidden");
    hideUndo();
  }
});

/* TODAY CARD (zeigt IMMER echten heutigen Stand) */
function loadToday(){
  const todayId = dateId(new Date());

  db.collection("proteinTracker").doc(todayId).onSnapshot(s=>{
    const d = s.exists ? s.data() : {};
    USERS.forEach(u=>{
      const v = d[u] || 0;
      const p = Math.round(v / TARGET * 100);
      const bar = el(`today${u}`);
      bar.style.width = Math.min(100,p)+"%";
      bar.className = "fill "+color(p);
      el(`today${u}Text`).textContent = `${v} g / ${TARGET} g (${p}%)`;
    });
  });
}

/* WEEK */
function loadWeek(offset){
  const base = startOfWeek(new Date());
  base.setDate(base.getDate()+offset);
  const target = offset===0 ? el("weekChart") : el("lastWeekChart");
  target.innerHTML = "";

  for(let i=0;i<7;i++){
    const d = addDays(base,i);
    const id = dateId(d);
    const isThisWeek = offset === 0;
    const isFuture = d > new Date();
    const clickable = isThisWeek && !isFuture;

    const elDay = document.createElement("div");
    elDay.className = "week-day";
    if(id === activeDate && isThisWeek) elDay.classList.add("today");

    elDay.innerHTML = `
      ${["Mo","Di","Mi","Do","Fr","Sa","So"][i]}<br>${d.getDate()}.${d.getMonth()+1}
      <div class="week-bar"><div class="week-fill noah" id="w-${id}-Noah"></div></div>
      <div class="week-bar"><div class="week-fill max" id="w-${id}-Max"></div></div>
    `;

    if(clickable){
      elDay.classList.add("clickable");
      elDay.onclick = ()=>{
        activeDate = id;
        hideUndo();
        loadWeek(0); // nur diese Woche neu zeichnen
      };
    }

    target.appendChild(elDay);

    setTimeout(()=>{
      db.collection("proteinTracker").doc(id).onSnapshot(s=>{
        const data = s.exists ? s.data() : {};
        USERS.forEach(u=>{
          const v = data[u] || 0;
          const p = Math.min(100, v / TARGET * 100);
          const b = el(`w-${id}-${u}`);
          if(b) b.style.width = p+"%";
        });
      });
    }, i*60);
  }
}

/* SAVE (wirkt auf activeDate!) */
el("saveBtn").onclick=async()=>{
  const input = el("proteinInput");
  const value = Number(input.value);
  if(!value || value<0 || value>300 || !currentUser) return;

  await db.collection("proteinTracker").doc(activeDate)
    .set(
      {[currentUser]: firebase.firestore.FieldValue.increment(value)},
      {merge:true}
    );

  input.value="";
  haptic("soft");

  setUndo({
    user: currentUser,
    date: activeDate,
    value
  });
};

/* 🔁 UNDO */
function setUndo(entry){
  undoEntry = entry;
  clearTimeout(undoTimer);
  const btn = el("undoBtn");
  btn.textContent = "Rückgängig";
  btn.style.display = "inline";
  undoTimer = setTimeout(hideUndo, 10000);
}

function hideUndo(){
  undoEntry = null;
  clearTimeout(undoTimer);
  el("undoBtn").style.display = "none";
}

el("undoBtn").onclick = async()=>{
  if(!undoEntry) return;

  await db.collection("proteinTracker").doc(undoEntry.date)
    .set(
      {[undoEntry.user]: firebase.firestore.FieldValue.increment(-undoEntry.value)},
      {merge:true}
    );

  haptic("light");
  hideUndo();
};
