const pty = require('node-pty');

const proc = pty.spawn('cat', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

proc.on('data', function(data) {
  console.log({ data });
});

proc.on('exit', function() {
  console.log('exit', arguments);
});

proc.write('foo');
proc.end();
