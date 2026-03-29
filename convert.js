const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;

const text = fs.readFileSync("songs.txt", "utf-8");

const lines = text.split("\n");

let videoId = "";
let results = [];

function extractVideoId(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : "";
}

async function fetchVideoInfo(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = json.items[0];

  return {
    title: item.snippet.title,
    date: item.snippet.publishedAt,
  };
}

(async () => {
  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("video:")) {
      videoId = extractVideoId(line);
      var videoInfo = await fetchVideoInfo(videoId);
      continue;
    }

    const match = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)\s*\/\s*(.+)/);
    if (!match) continue;

    const [, time, title, artist] = match;

    const songId = title.toLowerCase().replace(/[^\w]/g, "");

    results.push({
      title: title.trim(),
      artist: artist.trim(),
      songId,
      videoId,
      videoTitle: videoInfo.title,
      date: videoInfo.date,
      time,
    });
  }

  fs.writeFileSync("data.json", JSON.stringify(results, null, 2));
})();