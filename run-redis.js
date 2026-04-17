const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const url = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip";
const file = fs.createWriteStream("redis.zip");

console.log("Downloading Redis...");
https.get(url, function(response) {
  // Check for redirect
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, function(res2) {
      res2.pipe(file);
      file.on('finish', () => finishDownload());
    });
  } else {
    response.pipe(file);
    file.on('finish', () => finishDownload());
  }
});

function finishDownload() {
  file.close();
  console.log("Extracting...");
  execSync('powershell Expand-Archive -Path redis.zip -DestinationPath redis -Force');
  console.log("Starting Redis...");
  const { spawn } = require('child_process');
  spawn('.\\redis\\redis-server.exe', ['--port', '6379'], { detached: true, stdio: 'ignore' }).unref();
  console.log("Redis started on 6379");
}
