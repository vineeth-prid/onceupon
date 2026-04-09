const { spawnSync } = require('child_process');
const result = spawnSync('npx.cmd', ['--yes', 'prisma', 'generate'], {
  cwd: __dirname,
  stdio: 'pipe',
  encoding: 'utf-8',
});
console.log('STDOUT:', result.stdout);
console.error('STDERR:', result.stderr);
console.error('STATUS:', result.status);
if (result.error) console.error('ERROR:', result.error);
