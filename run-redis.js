const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Redis 7+ is required for BullMQ v5. Using community Windows build from
// https://github.com/redis-windows/redis-windows
const REDIS_VERSION = '8.6.2';
const ZIP_NAME = `Redis-${REDIS_VERSION}-Windows-x64-msys2.zip`;
const DOWNLOAD_URL = `https://github.com/redis-windows/redis-windows/releases/download/${REDIS_VERSION}/${ZIP_NAME}`;
const REDIS_DIR = path.join(__dirname, 'redis');
const ZIP_PATH = path.join(__dirname, ZIP_NAME);

function findRedisServer() {
  // The zip extracts into a subfolder; find redis-server.exe recursively
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase() === 'redis-server.exe') return full;
      if (entry.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(REDIS_DIR);
}

function startRedis(serverExe) {
  console.log(`Starting Redis from: ${serverExe}`);
  const child = spawn(serverExe, ['--port', '6379'], {
    detached: true,
    stdio: 'ignore',
    cwd: path.dirname(serverExe),
  });
  child.unref();
  console.log(`Redis ${REDIS_VERSION} started on port 6379 (PID: ${child.pid})`);
}

// Check if redis is already extracted
const existingServer = findRedisServer();
if (existingServer) {
  console.log('Redis already downloaded.');
  startRedis(existingServer);
  process.exit(0);
}

// Follow redirects (GitHub uses 302)
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = (u) => {
      https.get(u, { headers: { 'User-Agent': 'node' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    };
    request(url);
  });
}

(async () => {
  try {
    console.log(`Downloading Redis ${REDIS_VERSION} for Windows...`);
    await download(DOWNLOAD_URL, ZIP_PATH);
    console.log('Download complete. Extracting...');
    execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${REDIS_DIR}' -Force"`);
    console.log('Extraction complete.');

    // Clean up zip
    try { fs.unlinkSync(ZIP_PATH); } catch (_) {}

    const server = findRedisServer();
    if (!server) {
      console.error('ERROR: redis-server.exe not found after extraction.');
      process.exit(1);
    }
    startRedis(server);
  } catch (err) {
    console.error('Failed to set up Redis:', err.message || err);
    process.exit(1);
  }
})();
