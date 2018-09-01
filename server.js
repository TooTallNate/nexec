const next = require('next');
const execa = require('execa');
const isBot = require('is-bot');
const { parse } = require('url');
const fetch = require('node-fetch');
const toStream = require('buffer-to-stream');

const shouldServeHTML = req => {
  if (/html/i.test(req.headers.accept)) return true;
  if (/(curl|wget)/i.test(req.headers['user-agent'])) return false;
  return isBot(req.headers['user-agent']);
};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const appPrepare = app.prepare();

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
    let stdin = req;
    if (query.stdin) {
      stdin = toStream(Buffer.from(query.stdin, 'utf8'));
    } else if (query.stdin_url) {
      const r = await fetch(query.stdin_url);
      stdin = r.body;
    }
    const proc = execa(command, args);
    stdin.pipe(proc.stdin);
    const result = await proc;
    return result.stdout;
  }
};
