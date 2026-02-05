// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDL27YgLcePboLFybnXMjeHGhsjSEvUGzk",
  authDomain: "strangerpark-chat-and-talk.firebaseapp.com",
  projectId: "strangerpark-chat-and-talk",
  storageBucket: "strangerpark-chat-and-talk.appspot.com",
  messagingSenderId: "104131882938",
  appId: "1:104131882938:web:f9e585d35421625bf37783"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// PEERJS
let peer = new Peer();
let myPeerId = "";
let conn = null;
let myStream = null;

peer.on("open", id => myPeerId = id);

// AUTH
function register() {
  if (password.value.length < 6) return alert("Password min 6 chars");
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(showProfile)
    .catch(e => alert(e.message));
}

function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(showProfile)
    .catch(e => alert(e.message));
}

function guest() {
  auth.signInAnonymously().then(showProfile);
}

function showProfile() {
  loginBox.style.display = "none";
  profileBox.style.display = "block";
}

// ONLINE COUNT
db.collection("users")
  .where("status","==","waiting")
  .onSnapshot(s => onlineCount.innerText = s.size);

// MATCHING
async function startMatching() {
  if (!username.value || !gender.value || !looking.value)
    return alert("Fill all fields");

  profileBox.style.display = "none";
  waitingBox.style.display = "block";

  const user = auth.currentUser;

  await db.collection("users").doc(user.uid).set({
    gender: gender.value,
    looking: looking.value,
    peerId: myPeerId,
    status: "waiting"
  });

  findMatch();
}

async function findMatch() {
  const user = auth.currentUser;
  const me = await db.collection("users").doc(user.uid).get();

  const snap = await db.collection("users")
    .where("gender","==",me.data().looking)
    .where("looking","==",me.data().gender)
    .where("status","==","waiting")
    .limit(1).get();

  if (!snap.empty) {
    const other = snap.docs[0];
    await db.collection("users").doc(user.uid).update({status:"chatting"});
    await db.collection("users").doc(other.id).update({status:"chatting"});
    conn = peer.connect(other.data().peerId);
    conn.on("open", startVideoChat);
  } else setTimeout(findMatch, 3000);
}

// VIDEO
async function getMedia() {
  myStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  myVideo.srcObject = myStream;
}

peer.on("call", call => {
  getMedia().then(() => {
    call.answer(myStream);
    call.on("stream", r => remoteVideo.srcObject = r);
  });
});

function startVideoChat() {
  waitingBox.style.display="none";
  chatBox.style.display="block";
  getMedia().then(() => {
    const call = peer.call(conn.peer, myStream);
    call.on("stream", r => remoteVideo.srcObject = r);
  });
}

function toggleMic() {
  myStream.getAudioTracks()[0].enabled =
    !myStream.getAudioTracks()[0].enabled;
}

function toggleCam() {
  myStream.getVideoTracks()[0].enabled =
    !myStream.getVideoTracks()[0].enabled;
}

function nextStranger() {
  location.reload();
}

// ROOMS
let currentRoom = "";

function joinRoom(room) {
  roomsBox.style.display="none";
  roomChatBox.style.display="block";
  roomTitle.innerText = room.toUpperCase();
  currentRoom = room;

  db.collection("rooms").doc(room).collection("msgs")
    .orderBy("time")
    .onSnapshot(s => {
      roomMessages.innerHTML="";
      s.forEach(d => roomMessages.innerHTML += `<p>${d.data().msg}</p>`);
    });
}

function sendRoomMsg() {
  if (!roomMsg.value) return;
  db.collection("rooms").doc(currentRoom)
    .collection("msgs")
    .add({ msg: roomMsg.value, time: Date.now() });
  roomMsg.value="";
}

function leaveRoom() {
  roomChatBox.style.display="none";
  roomsBox.style.display="block";
}

function guest() {
  auth.signInAnonymously().then(showProfile);
}

function showProfile() {
  loginBox.style.display = "none";
  profileBox.style.display = "block";
}

// ONLINE COUNT
db.collection("users").where("status","==","waiting")
.onSnapshot(s => onlineCount.innerText = s.size);

// MATCHING
async function startMatching() {
  if (!username.value || !gender.value || !looking.value)
    return alert("Fill all fields");

  profileBox.style.display = "none";
  waitingBox.style.display = "block";

  const user = auth.currentUser;
  await db.collection("users").doc(user.uid).set({
    gender: gender.value,
    looking: looking.value,
    peerId: myPeerId,
    status: "waiting"
  });

  findMatch();
}

async function findMatch() {
  const user = auth.currentUser;
  const me = await db.collection("users").doc(user.uid).get();

  const snap = await db.collection("users")
    .where("gender","==",me.data().looking)
    .where("looking","==",me.data().gender)
    .where("status","==","waiting")
    .limit(1).get();

  if (!snap.empty) {
    const other = snap.docs[0];
    await db.collection("users").doc(user.uid).update({status:"chatting"});
    await db.collection("users").doc(other.id).update({status:"chatting"});
    conn = peer.connect(other.data().peerId);
    conn.on("open", startVideoChat);
  } else setTimeout(findMatch,3000);
}

// VIDEO
async function getMedia() {
  myStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  myVideo.srcObject = myStream;
}

peer.on("call", call => {
  getMedia().then(()=>{
    call.answer(myStream);
    call.on("stream", r => remoteVideo.srcObject = r);
  });
});

function startVideoChat() {
  waitingBox.style.display="none";
  chatBox.style.display="block";
  getMedia().then(()=>{
    const call = peer.call(conn.peer,myStream);
    call.on("stream", r => remoteVideo.srcObject = r);
  });
}

function toggleMic() {
  myStream.getAudioTracks()[0].enabled =
    !myStream.getAudioTracks()[0].enabled;
}

function toggleCam() {
  myStream.getVideoTracks()[0].enabled =
    !myStream.getVideoTracks()[0].enabled;
}

function nextStranger() {
  location.reload();
}

// ROOMS
let currentRoom = "";

function joinRoom(room) {
  roomsBox.style.display="none";
  roomChatBox.style.display="block";
  roomTitle.innerText = room.toUpperCase();
  currentRoom = room;

  db.collection("rooms").doc(room).collection("msgs")
    .orderBy("time").onSnapshot(s=>{
      roomMessages.innerHTML="";
      s.forEach(d=>roomMessages.innerHTML+=`<p>${d.data().msg}</p>`);
    });
}

function sendRoomMsg() {
  if (!roomMsg.value) return;
  db.collection("rooms").doc(currentRoom)
    .collection("msgs")
    .add({msg:roomMsg.value,time:Date.now()});
  roomMsg.value="";
}

function leaveRoom() {
  roomChatBox.style.display="none";
  roomsBox.style.display="block";
           }
