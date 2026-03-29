let data = [];
let songsCache = [];

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    buildSongs();
    renderAll();
  });

function buildSongs() {
  const map = {};

  data.forEach(d => {
    if (!map[d.songId]) {
      map[d.songId] = {
        title: d.title,
        artist: d.artist,
        count: 0,
        latest: d,
      };
    }

    map[d.songId].count++;

    if (new Date(d.date) > new Date(map[d.songId].latest.date)) {
      map[d.songId].latest = d;
    }
  });

  songsCache = Object.values(map);
}

function renderAll() {
  renderSongs();
  renderStreams();
  renderArtists();
}

//
// 曲一覧（修正済み）
//
function renderSongs() {
  let arr = [...songsCache];

  const keyword = document.getElementById("search").value.toLowerCase();

  if (keyword) {
    arr = arr.filter(s =>
      s.title.toLowerCase().includes(keyword) ||
      s.artist.toLowerCase().includes(keyword)
    );
  }

  const sortType = document.getElementById("sort").value;

  arr.sort((a, b) => {
    switch (sortType) {
      case "title_desc": return b.title.localeCompare(a.title);
      case "artist_asc": return a.artist.localeCompare(b.artist);
      case "artist_desc": return b.artist.localeCompare(a.artist);
      case "count_desc": return b.count - a.count;
      case "count_asc": return a.count - b.count;
      default: return a.title.localeCompare(b.title);
    }
  });

  const tbody = document.getElementById("songsBody");
  tbody.innerHTML = "";

  arr.forEach(s => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.title}</td>
      <td>${s.artist}</td>
      <td>${s.count}</td>
      <td><button onclick="play('${s.latest.videoId}','${s.latest.time}')">▶</button></td>
    `;

    tbody.appendChild(tr);
  });
}

//
// 配信一覧（カード化）
//
function renderStreams() {
  const map = {};

  data.forEach(d => {
    if (!map[d.videoId]) {
      map[d.videoId] = {
        title: d.videoTitle,
        songs: [],
      };
    }
    map[d.videoId].songs.push(d.title);
  });

  const container = document.getElementById("streamsContainer");
  container.innerHTML = "";

  Object.entries(map).forEach(([videoId, s]) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <a href="https://youtube.com/watch?v=${videoId}" target="_blank">${s.title}</a>
      <div class="song-grid">
        ${[...new Set(s.songs)].map(t => `<span>${t}</span>`).join("")}
      </div>
    `;

    container.appendChild(div);
  });
}

//
// アーティスト（昇順デフォルト）
//
function renderArtists() {
  const map = {};

  data.forEach(d => {
    if (!map[d.artist]) map[d.artist] = {};

    if (!map[d.artist][d.songId]) {
      map[d.artist][d.songId] = {
        title: d.title,
        count: 0,
      };
    }

    map[d.artist][d.songId].count++;
  });

  const tbody = document.getElementById("artistsBody");
  tbody.innerHTML = "";

  Object.keys(map)
    .sort((a, b) => a.localeCompare(b))
    .forEach(artist => {
      Object.values(map[artist]).forEach(s => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${artist}</td>
          <td>${s.title}</td>
          <td>${s.count}</td>
        `;

        tbody.appendChild(tr);
      });
    });
}

//
// UI
//
function showTab(id) {
  ["songs", "streams", "artists"].forEach(t => {
    document.getElementById(t).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function play(videoId, time) {
  const sec = toSeconds(time);
  const url = `https://www.youtube.com/embed/${videoId}?start=${sec}`;

  document.getElementById("player").innerHTML =
    `<iframe src="${url}" allowfullscreen></iframe>`;

  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("player").innerHTML = "";
}

function toSeconds(t) {
  return t.split(":").map(Number).reduce((a, b) => a * 60 + b);
}

document.getElementById("search").addEventListener("input", renderSongs);
document.getElementById("sort").addEventListener("change", renderSongs);