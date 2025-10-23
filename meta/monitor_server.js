const { spawn } = require('child_process'); // eslint-disable-line @typescript-eslint/no-var-requires
const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-var-requires
const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

// Function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${message}`);
}

// Start the server using ts-node
log('Starting server...');
const server = spawn('npx', ['ts-node', 'src/api/server.ts'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Create log file
const logStream = fs.createWriteStream(
  path.join(process.cwd(), 'activity_log.txt'),
  { flags: 'a' }
);

// Log server output
server.stdout.on('data', data => {
  const output = data.toString();
  logStream.write(`[SERVER-OUT] ${new Date().toISOString()} ${output}`);
  process.stdout.write(`[SERVER-OUT] ${output}`);
});

server.stderr.on('data', data => {
  const output = data.toString();
  logStream.write(`[SERVER-ERR] ${new Date().toISOString()} ${output}`);
  process.stderr.write(`[SERVER-ERR] ${output}`);
});

// Function to simulate user/developer actions
async function simulateActions() {
  const { exec } = require('child_process'); // eslint-disable-line @typescript-eslint/no-var-requires

  // Wait a bit for server to fully start
  await new Promise(resolve => setTimeout(resolve, 2000));

  log('Starting to simulate user/developer actions...');

  // Array of endpoints to hit
  const endpoints = [
    '/api/health',
    '/api/version',
    '/api/info',
    '/api/items',
    '/api/random',
    '/index.html',
    '/docs.html',
  ];

  // Make requests for 1 minute
  const startTime = Date.now();
  const oneMinute = 60 * 1000;

  while (Date.now() - startTime < oneMinute) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    // Log developer action
    logStream.write(
      `[DEV-ACTION] ${new Date().toISOString()} Requesting ${endpoint}\n`
    );

    await new Promise(resolve => {
      exec(
        `curl -s -o /dev/null -w "HTTP Status: %{http_code}\\nTime: %{time_total}s\\n" http://localhost:3000${endpoint}`,
        (error, stdout) => {
          if (error) {
            logStream.write(
              `[ERROR] ${new Date().toISOString()} ${error.message}\n`
            );
          }

          logStream.write(
            `[RESPONSE] ${new Date().toISOString()} ${endpoint}: ${stdout}`
          );
          resolve();
        }
      );
    });

    // Wait a bit between requests
    await new Promise(resolve =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );
  }

  log('Finished simulating actions');
  logStream.end();
}

// Start simulation
simulateActions();

// Stop server after 1 minute
setTimeout(() => {
  log('Stopping server after 1 minute...');
  server.kill();
  process.exit(0);
}, 60000); // 60 seconds
