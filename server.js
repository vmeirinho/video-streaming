const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('/video', (req, res) => {
  const videoName = req.query.name
  const videoPath = path.join(__dirname, 'videos', videoName);
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, headers);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
