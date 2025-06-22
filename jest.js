const path = require('path');
const { spawn } = require('child_process');

const jestPath = path.resolve(__dirname, 'node_modules', '.bin', 'jest');

const args = process.argv.slice(2);

const jest = spawn(jestPath, args, { stdio: ['inherit', 'pipe', 'pipe'] });

const stripAnsi = chunk =>
    chunk.toString().replace(/\x1B\[(?:[0-9]*[A|K])/g, '');

jest.stdout.on('data', data => {
    process.stdout.write(stripAnsi(data));
});

jest.stderr.on('data', data => {
    process.stderr.write(stripAnsi(data));
});

const interval = setInterval(() => {
    process.stdout.write('.');
}, 1000);

jest.on('close', code => {
    clearInterval(interval);
    process.stdout.write('\n');
    process.exit(code);
});
