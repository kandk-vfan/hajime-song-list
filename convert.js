const fs = require("fs");

const input = fs.readFileSync("songs.txt", "utf-8");
const lines = input.split("\n");

let currentVideoId = "";
const results = [];

function extractVideoId(url) {
  const m = url.match(/v=([^&]+)/);
  return m ? m[1] : "";
}

function isTimeLine(line) {
  return /^\d{1,2}:\d{2}:\d{2}\s/.test(line);
}

function parseLine(line) {
  if (!isTimeLine(line)) return null;

  const firstSpace = line.indexOf(" ");
  const time = line.slice(0, firstSpace);
  const rest = line.slice(firstSpace + 1);

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

  if (!line) return;

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