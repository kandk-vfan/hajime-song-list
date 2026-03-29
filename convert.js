const fs = require("fs");

const input = fs.readFileSync("songs.txt", "utf-8");
const lines = input.split("\n");

let currentVideoId = "";
const results = [];

function extractVideoId(url) {
  const m = url.match(/v=([^&]+)/);
  return m ? m[1] : "";
}

function parseLine(line) {
  const match = line.match(/^(\d{1,2}:\d{2}:\d{2})\s+(.+)$/);
  if (!match) return null;

  const time = match[1];
  const rest = match[2];

  let title = rest;
  let artist = "";

  if (rest.includes(" / ")) {
    const parts = rest.split(" / ");
    title = parts[0].trim();
    artist = parts.slice(1).join(" / ").trim();
  }

  return { time, title, artist };
}

lines.forEach(line => {
  line = line.trim();

  if (line.startsWith("video:")) {
    const url = line.replace("video:", "").trim();
    currentVideoId = extractVideoId(url);
    return;
  }

  const parsed = parseLine(line);
  if (!parsed) return;

  results.push({
    videoId: currentVideoId,
    time: parsed.time,
    title: parsed.title,
    artist: parsed.artist,
    date: new Date().toISOString()
  });
});

fs.writeFileSync("data.json", JSON.stringify(results, null, 2));