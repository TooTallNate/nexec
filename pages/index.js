import url from 'url';
import qs from 'querystring';
import Head from 'next/head';
import Router from 'next/router';
import createDebug from 'debug';

import popup from '../lib/popup';
import parseCommand from '../lib/parse-command';

const debug = createDebug('nexec');

const examples = [
  { command: 'echo Hello World!' },
  { command: 'cat', stdin: 'Hello World!' },
  { command: 'jq -r .[].version', stdin_url: 'https://nodejs.org/dist/index.json' },
];



export default class extends React.Component {
  static getInitialProps() {
    return {};
  }

  constructor(...args) {
    super(...args);
    this.metaKey = false;
    this.state = { host: 'nexec.n8.io', command: '' };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.showExample = this.showExample.bind(this);
    if (typeof location !== 'undefined') {
      const query = qs.parse(location.search.substring(1));
      Object.assign(this.state, query, {
        host: location.host,
      });
    }
    debug('Initial state: %o', this.state);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.onKeyUp, false);
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillReceiveProps({url: {query}}) {
    delete query.host;
    if (!query.command) query.command = '';
    if (!query.stdin) query.stdin = '';
    if (!query.stdin_url) query.stdin_url = '';
    this.setState(query);
  }

  showExample(e) {
    e.preventDefault();
    const example = examples[Math.floor(Math.random() * examples.length)];
    this.setCommand(example);
  }

  setCommand(queryObj) {
    const query = qs.stringify(queryObj);
    const page = `/${query ? '?'+query : ''}`;
    const as = `${location.pathname}?${query}`;

    const { command = '' } = queryObj;
    if (this.refs.command.value !== command) {
      this.refs.command.value = command;
      this.refs.command.focus();
    }

    Router.replace(page, as, {shallow: true});
  }

  onKeyUp(e) {
    this.metaKey = false;
  }

  onKeyDown(e) {
    this.metaKey = e.metaKey;
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.metaKey) {
      popup(
        this.refs.link.href,
        'nexec',
        800,
        600
      );
    } else {
      window.location = this.refs.link.href;
    }
  }

  async onChange(e) {
    const command = this.refs.command.value;
    const query = {};
    if (command) query.command = command;
    this.setCommand(query);
  }

  render() {
    const {stdin, stdin_url} = this.state;
    const [command = '', ...arg] = parseCommand(this.state.command);
    const cmd = encodeURIComponent(command);
    const query = {};
    if (arg.length > 0) query.arg = arg;
    if (stdin) query.stdin = stdin;
    if (stdin_url) query.stdin_url = stdin_url;
    const queryStr = qs.stringify(query);
    const href = `/${cmd}${queryStr ? '?'+queryStr : ''}`
    let title = `${this.state.host}`;
    if (command) {
      title += href;
    }

    const showInputClassName = `hidden ${command ? 'visible' : ''}`;
    const showExampleClassName = `hidden ${!command ? 'visible' : ''}`;

    return (
      <div id="root">
        <Head>
          <title>{this.state.host}</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, user-scalable=no"
            key="viewport"
          />
          <link href="https://sf.n8.io/?weight=100,200" rel="stylesheet" />
        </Head>

        <div id="content">
          <h1><a href={href} ref="link" onClick={this.onSubmit}>{title}</a></h1>
          <p>Execute a remote command over HTTP.</p>
          <form
            autoComplete="off"
            onChange={this.onChange}
            onSubmit={this.onSubmit}
          >
            <p>
              <label>
                <input
                  ref="command"
                  type="text"
                  autoFocus="on"
                  className="command"
                  defaultValue={this.state.command}
                  placeholder="Enter a Command"
                />
              </label>
            </p>
            <div className="bottom">
              <div className={showExampleClassName}>
                <a href="#" onClick={this.showExample}>(Show me an example…)</a>
              </div>
              <div className={showInputClassName}>
                <label>
                  Add <code>STDIN</code>?{' '}
                  <input ref="showInput" type="checkbox" />
                </label>
              </div>
            </div>
          </form>
        </div>

        <style jsx>{`
          #root {
            align-items: center;
            display: flex;
            justify-content: center;
            height: 100%;
          }

          #content {
            text-align: center;
          }

          a {
            color: inherit;
            text-decoration: none;
            position: relative;
          }

          h1,
          h2 {
            margin: 0;
            font-weight: 200;
          }

          h1 {
            font-size: 3em;
          }

          code {
            position: relative;
            top: -0.11em;
          }

          .command {
            background-color: transparent;
            border: none;
            color #fff;
            text-align: center;
            font-size: 0.8em;
            font-weight: 100;
            width: 100%;
          }

          .bottom {
            position: relative;
            min-height: 2em;
            text-align: left;
            font-size: 0.9em;
          }

          .bottom > div {
            position: absolute;
            text-align: center;
            width: 100%;
          }

          .hidden {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease-in-out 0s;
          }

          .visible {
            opacity: 1;
            pointer-events: initial;
          }
        `}</style>

        <style global jsx>{`
          html,
          body {
            background-color: #161616;
            color: #ccc;
            font-family: 'San Francisco', sans-serif;
          }

          html,
          body,
          #__next {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }

          *:focus {
            outline: none;
          }
        `}</style>
      </div>
    );
  }
}
