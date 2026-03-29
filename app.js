let data = [];

fetch("data.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    renderAll();
  });

//
// 共通キー（最重要）
//
function key(d) {
  return d.title + "||" + d.artist;
}

//
// 曲一覧
//
function renderSongs() {
  const map = {};

  data.forEach(d => {
    const k = key(d);

    if (!map[k]) {
      map[k] = {
        title: d.title,
        artist: d.artist,
        count: 0,
        latest: d,
      };
    }

    map[k].count++;

    if (new Date(d.date) > new Date(map[k].latest.date)) {
      map[k].latest = d;
    }
  });

  let arr = Object.values(map);

  const keyword = document.getElementById("search").value.toLowerCase();

  if (keyword) {
    arr = arr.filter(s =>
      s.title.toLowerCase().includes(keyword) ||
      s.artist.toLowerCase().includes(keyword)
    );
  }

  const sort = document.getElementById("sortSongs").value;

  arr.sort((a,b)=>{
    switch(sort){
      case "count": return b.count - a.count;
      case "artist": return a.artist.localeCompare(b.artist);
      default: return a.title.localeCompare(b.title);
    }
  });

  const tbody = document.getElementById("songsBody");
  tbody.innerHTML = "";

  arr.forEach(s=>{
    tbody.innerHTML += `
<tr>
<td>${s.title}</td>
<td>${s.artist}</td>
<td>${s.count}</td>
<td><button onclick="play('${s.latest.videoId}','${s.latest.time}')">▶</button></td>
</tr>`;
  });
}

//
// 配信一覧（カード + 連番 + 日付）
//
function renderStreams() {
  const map = {};

  data.forEach(d=>{
    if(!map[d.videoId]){
      map[d.videoId]={
        title:d.videoTitle,
        date:d.date,
        songs:[]
      };
    }
    map[d.videoId].songs.push(d);
  });

  let arr = Object.entries(map);

  arr.sort((a,b)=> new Date(b[1].date) - new Date(a[1].date));

  const container = document.getElementById("streamsContainer");
  container.innerHTML="";

  arr.forEach(([vid,v],i)=>{
    const card = document.createElement("div");
    card.className="card";

    card.innerHTML=`
<a href="https://youtube.com/watch?v=${vid}" target="_blank">${v.title}</a>
<div class="date">${new Date(v.date).toLocaleString()}</div>
<div class="grid">
${v.songs.map((s,i)=>`
<div class="song">
<span class="num">${String(i+1).padStart(2,"0")}</span>
<span>${s.title}</span>
</div>
`).join("")}
</div>
`;

    container.appendChild(card);
  });
}

//
// アーティスト（ソート対応）
//
function renderArtists() {
  const map = {};

  data.forEach(d=>{
    if(!map[d.artist]) map[d.artist]={};

    const k = key(d);

    if(!map[d.artist][k]){
      map[d.artist][k]={title:d.title,count:0};
    }

    map[d.artist][k].count++;
  });

  let artists = Object.keys(map);

  const sort = document.getElementById("sortArtists").value;

  if(sort==="desc"){
    artists.sort((a,b)=>b.localeCompare(a));
  }else{
    artists.sort((a,b)=>a.localeCompare(b));
  }

  const tbody = document.getElementById("artistsBody");
  tbody.innerHTML="";

  artists.forEach(a=>{
    Object.values(map[a]).forEach(s=>{
      tbody.innerHTML+=`
<tr>
<td>${a}</td>
<td>${s.title}</td>
<td>${s.count}</td>
</tr>`;
    });
  });
}

//
// UI
//
function renderAll(){
  initSort();
  renderSongs();
  renderStreams();
  renderArtists();
}

function initSort(){
  document.getElementById("sortSongs").innerHTML=`
<option value="title">曲名</option>
<option value="artist">アーティスト</option>
<option value="count">回数</option>`;

  document.getElementById("sortArtists").innerHTML=`
<option value="asc">昇順</option>
<option value="desc">降順</option>`;
}

function showTab(id){
  ["songs","streams","artists"].forEach(t=>{
    document.getElementById(t).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function play(videoId,time){
  const sec=time.split(":").reduce((a,b)=>a*60+Number(b));
  document.getElementById("player").innerHTML=
`<iframe src="https://www.youtube.com/embed/${videoId}?start=${sec}" allowfullscreen></iframe>`;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("search").addEventListener("input", renderSongs);
document.getElementById("sortSongs").addEventListener("change", renderSongs);
document.getElementById("sortArtists").addEventListener("change", renderArtists);