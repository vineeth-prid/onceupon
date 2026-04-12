const { execSync } = require('child_process');
try {
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit', cwd: "d:\\react_storybook\\once-upon-a-time\\apps\\frontend" });
  console.log('Build successful!');
} catch (e) {
  console.error('Build failed');
}
