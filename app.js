let data = [];
let songs = {};

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    aggregate();
    render();
  });

function aggregate() {
  songs = {};

  data.forEach(d => {
    const key = d.songId;

    if (!songs[key]) {
      songs[key] = {
        title: d.title,
        artist: d.artist,
        count: 0,
        latest: d,
      };
    }

    songs[key].count++;

    if (new Date(d.date) > new Date(songs[key].latest.date)) {
      songs[key].latest = d;
    }
  });
}

function render(list = Object.values(songs)) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  list.sort((a, b) => a.title.localeCompare(b.title));

  list.forEach(s => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.title}</td>
      <td>${s.artist}</td>
      <td>${s.count}</td>
      <td><button onclick="play('${s.latest.videoId}', '${s.latest.time}')">再生</button></td>
    `;

    tbody.appendChild(tr);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();

  const filtered = Object.values(songs).filter(s =>
    s.title.toLowerCase().includes(val) ||
    s.artist.toLowerCase().includes(val)
  );

  render(filtered);
});

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
  const parts = t.split(":").map(Number);
  return parts.reduce((a, b) => a * 60 + b);
}