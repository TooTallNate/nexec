const ms = require('ms');
const yn = require('yn');
const next = require('next');
const once = require('p-event');
const pty = require('node-pty');
const isBot = require('is-bot');
const ndjson = require('ndjson');
const { parse } = require('url');
const cp = require('child_process');
const fetch = require('node-fetch');
const through2 = require('through2');
const toStream = require('buffer-to-stream');
const netstring = require('netstring-stream');

const shouldServeHTML = req => {
  if (/html/i.test(req.headers.accept)) return true;
  if (/(curl|wget)/i.test(req.headers['user-agent'])) return false;
  return isBot(req.headers['user-agent']);
};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const appPrepare = app.prepare();

function ioStream (type) {
  return through2.obj(function (chunk, enc, callback) {
    this.push({ type, data: chunk.toString('utf8') });
    callback();
  });
}

function spawn(isPTY, command, args, options) {
  let proc;
  let stdin;
  let stdout;
  let stderr;
  let exitPromise;
  if (isPTY) {
    proc = pty.spawn(command, args, options);
    stdin = stdout = proc;
    exitPromise = once(proc, 'exit');
  } else {
    proc = cp.spawn(command, args);
    stdin = proc.stdin;
    stdout = proc.stdout;
    stderr = proc.stderr;
    exitPromise = once(proc, 'close');
  }
  return { proc, stdin, stdout, stderr, exitPromise };
}

module.exports = async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const wantsHTML = shouldServeHTML(req);
  if (pathname === '/' || /^\/_next/.test(pathname)) {
    // Serve the front page
    await appPrepare;
    handle(req, res, parsedUrl)
  } else {
    const command = decodeURIComponent(pathname.substring(1));
    let args = [];
    if (Array.isArray(query.arg)) {
      args = query.arg;
    } else if (query.arg != null) {
      args = [ query.arg ];
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf8');
    res.setHeader('X-Cmd', command);

    // `stdin` for the process defaults to the request body, but may
    // be an explicit string value with `?stdin=str` or a remote URL
    // with `?stdin_url=url`
    let inputStream = req;
    if (query.stdin) {
      inputStream = toStream(Buffer.from(query.stdin, 'utf8'));
    } else if (query.stdin_url) {
      const r = await fetch(query.stdin_url);
      inputStream = r.body;
    }

    console.log({ command, args });
    let { proc, stdout, stdin, stderr, exitPromise } = spawn(yn(query.pty), command, args, {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: '/',
      env: process.env
    });

    // Time out the process if it takes too long to finish
    const timeout = ms('10s');
    const timeoutId = setTimeout(() => {
      console.error('Timed out!');
      proc.kill();
    }, timeout);

    //stdout.highWaterMark = 0;
    //stdout.lowWaterMark = 0;
    //stderr.highWaterMark = 0;
    //stderr.lowWaterMark = 0;

    //const ns = netstring.writeStream();
    //ns.pipe(res, { end: false });
    //const json = ndjson.stringify();
    //json.pipe(res);

    const ops = [ exitPromise ];

    stdout.pipe(res, {end: false});
    ops.push(once(stdout, 'end'));

    if (stderr) {
      stderr.pipe(res, {end: false});
      ops.push(once(stderr, 'end'));
    }

    //inputStream.pipe(stdin);
    stdin.end('foo\r');

    console.log({ops});
    const [ exit ] = await Promise.all(ops);
    clearTimeout(timeoutId);
    console.log('exit event', exit);
    res.end();
  }
};
