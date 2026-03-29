let data = [];
let activeTab = "songs";
const state = {
  songs: { search: "", sort: "title" },
  streams: { search: "", sort: "" },
  artists: { search: "", sort: "asc" }
};

fetch("data.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    syncToolbar();
    renderAll();
  });

function songKey(d) {
  return `${d.title}||${d.artist}`;
}

function renderAll() {
  renderSongs();
  renderStreams();
  renderArtists();
}

function syncToolbar() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  if (activeTab === "songs") {
    searchInput.placeholder = "曲名・アーティスト名で検索";
    searchInput.value = state.songs.search;
    sortSelect.innerHTML = `
      <option value="title">曲名順</option>
      <option value="artist">アーティスト順</option>
      <option value="count">回数順</option>
    `;
    sortSelect.value = state.songs.sort;
    sortSelect.classList.remove("hidden");
  }

  if (activeTab === "streams") {
    searchInput.placeholder = "曲名・アーティスト名で検索";
    searchInput.value = state.streams.search;
    sortSelect.innerHTML = "";
    sortSelect.classList.add("hidden");
  }

  if (activeTab === "artists") {
    searchInput.placeholder = "曲名・アーティスト名で検索";
    searchInput.value = state.artists.search;
    sortSelect.innerHTML = `
      <option value="asc">アーティスト昇順</option>
      <option value="desc">アーティスト降順</option>
    `;
    sortSelect.value = state.artists.sort;
    sortSelect.classList.remove("hidden");
  }
}

function renderSongs() {
  const map = {};

  data.forEach(d => {
    const k = songKey(d);

    if (!map[k]) {
      map[k] = {
        title: d.title,
        artist: d.artist,
        count: 0,
        latest: d
      };
    }

    map[k].count++;

    if (new Date(d.date) > new Date(map[k].latest.date)) {
      map[k].latest = d;
    }
  });

  let arr = Object.values(map);
  const keyword = state.songs.search.toLowerCase();

  if (keyword) {
    arr = arr.filter(s =>
      s.title.toLowerCase().includes(keyword) ||
      s.artist.toLowerCase().includes(keyword)
    );
  }

  arr.sort((a, b) => {
    if (state.songs.sort === "artist") return a.artist.localeCompare(b.artist);
    if (state.songs.sort === "count") return b.count - a.count;
    return a.title.localeCompare(b.title);
  });

  const tbody = document.getElementById("songsBody");
  tbody.innerHTML = "";

  arr.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.title)}</td>
      <td>${escapeHtml(s.artist)}</td>
      <td>${s.count}</td>
      <td><button type="button" onclick="play('${s.latest.videoId}','${s.latest.time}')">▶ 最新配信</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStreams() {
  const map = {};

  data.forEach(d => {
    if (!map[d.videoId]) {
      map[d.videoId] = {
        title: d.videoTitle,
        songs: []
      };
    }
    map[d.videoId].songs.push(d);
  });

  const arr = Object.entries(map);
  arr.sort((a, b) => {
    const aDate = a[1].songs.reduce((m, s) => Math.max(m, new Date(s.date).getTime()), 0);
    const bDate = b[1].songs.reduce((m, s) => Math.max(m, new Date(s.date).getTime()), 0);
    return bDate - aDate;
  });

  const keyword = state.streams.search.toLowerCase();
  const container = document.getElementById("streamsContainer");
  container.innerHTML = "";

  arr.forEach(([vid, stream]) => {
    const matched = stream.songs.some(s =>
      !keyword ||
      s.title.toLowerCase().includes(keyword) ||
      s.artist.toLowerCase().includes(keyword)
    );

    if (!matched) return;

    const card = document.createElement("div");
    card.className = "card";

    const uniqueSongs = [];
    const seen = new Set();

    stream.songs.forEach(s => {
      const k = `${s.time}||${s.title}||${s.artist}`;
      if (!seen.has(k)) {
        seen.add(k);
        uniqueSongs.push(s);
      }
    });

    card.innerHTML = `
      <div class="stream-title-row">
        <a href="https://youtube.com/watch?v=${vid}" target="_blank" rel="noopener noreferrer">${escapeHtml(stream.title)}</a>
      </div>
      <div class="grid">
        ${uniqueSongs.map((s, i) => `
          <div class="song-card">
            <div class="song-card-head">
              <span class="num">${String(i + 1).padStart(2, "0")}</span>
              <button type="button" onclick="play('${vid}','${s.time}')">▶</button>
            </div>
            <div class="song-card-title">${escapeHtml(s.title)}</div>
            <div class="song-card-artist">${escapeHtml(s.artist)}</div>
          </div>
        `).join("")}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderArtists() {
  const map = {};

  data.forEach(d => {
    if (!map[d.artist]) map[d.artist] = {};
    const k = songKey(d);

    if (!map[d.artist][k]) {
      map[d.artist][k] = {
        title: d.title,
        count: 0
      };
    }

    map[d.artist][k].count++;
  });

  let artists = Object.keys(map);
  artists.sort((a, b) => state.artists.sort === "desc" ? b.localeCompare(a) : a.localeCompare(b));

  const keyword = state.artists.search.toLowerCase();
  const tbody = document.getElementById("artistsBody");
  tbody.innerHTML = "";

  artists.forEach(artist => {
    const songs = Object.values(map[artist]).sort((a, b) => a.title.localeCompare(b.title));

    songs.forEach(song => {
      if (keyword && !(
        artist.toLowerCase().includes(keyword) ||
        song.title.toLowerCase().includes(keyword)
      )) {
        return;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(artist)}</td>
        <td>${escapeHtml(song.title)}</td>
        <td>${song.count}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

function showTab(id) {
  activeTab = id;

  document.getElementById("songs").classList.toggle("hidden", id !== "songs");
  document.getElementById("streams").classList.toggle("hidden", id !== "streams");
  document.getElementById("artists").classList.toggle("hidden", id !== "artists");

  document.getElementById("tabSongs").classList.toggle("active", id === "songs");
  document.getElementById("tabStreams").classList.toggle("active", id === "streams");
  document.getElementById("tabArtists").classList.toggle("active", id === "artists");

  syncToolbar();
}

function play(videoId, time) {
  const sec = time.split(":").reduce((a, b) => a * 60 + Number(b));
  document.getElementById("player").innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?start=${sec}&autoplay=1&rel=0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin">
    </iframe>
  `;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("player").innerHTML = "";
  document.getElementById("modal").classList.add("hidden");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.getElementById("searchInput").addEventListener("input", e => {
  state[activeTab].search = e.target.value;

  if (activeTab === "songs") renderSongs();
  if (activeTab === "streams") renderStreams();
  if (activeTab === "artists") renderArtists();
});

document.getElementById("sortSelect").addEventListener("change", e => {
  if (activeTab === "songs") {
    state.songs.sort = e.target.value;
    renderSongs();
  }

  if (activeTab === "artists") {
    state.artists.sort = e.target.value;
    renderArtists();
  }
});