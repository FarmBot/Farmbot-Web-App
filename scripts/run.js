const { spawn } = require('child_process');

const [execPath, ...args] = process.argv.slice(2);

const cmd = spawn(execPath, args, { stdio: ['inherit', 'pipe', 'pipe'] });

const stripAnsi = chunk =>
    chunk.toString().replace(/\x1B\[(?:[0-9]*[A|K])/g, '');

cmd.stdout.on('data', data => {
    process.stdout.write(stripAnsi(data));
});

cmd.stderr.on('data', data => {
    process.stderr.write(stripAnsi(data));
});

const interval = setInterval(() => {
    process.stdout.write('.\n');
}, 1000);

cmd.on('close', code => {
    clearInterval(interval);
    const name = process.env.npm_lifecycle_event || 'process';
    if (code !== 0) {
        process.stderr.write(`\n❌ ${name} failed with code: ${code}\n`);
    } else {
        process.stdout.write(`\n✅ ${name} completed successfully\n`);
    }
    process.exit(code);
});
