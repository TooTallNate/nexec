import url from 'url';
import qs from 'querystring';
import Head from 'next/head';
import Router from 'next/router';
import parseCommand from '../parse-command';

const examples = [
  {
    command: 'cat',
    stdin: 'Hello World!'
  }
];

export default class extends React.Component {
  static getInitialProps() {
    return {};
  }

  constructor(...args) {
    super(...args);
    this.state = { host: 'nexec.n8.io', command: '' };
    this.onChange = this.onChange.bind(this);
    if (typeof location !== 'undefined') {
      const query = qs.parse(location.search.substring(1));
      Object.assign(this.state, query, {
        host: location.host,
      });
    }
  }

  componentWillReceiveProps({url: {query}}) {
    delete query.host;
    if (!query.command) query.command = '';
    this.setState(query);
  }

  async onChange(e) {
    e.preventDefault();
    const command = e.currentTarget[0].value;
    const queryObj = {};
    if (command) {
      queryObj.command = command;
    }
    const query = qs.stringify(queryObj);
    const page = `/${query ? '?'+query : ''}`;
    const as = `${location.pathname}?${query}`;
    Router.replace(page, as, {shallow: true});
  }

  render() {
    const [command = '', ...arg] = parseCommand(this.state.command);
    const cmd = encodeURIComponent(command);
    const query = {
      arg,
    };
    const queryStr = qs.stringify(query);
    const href = `/${cmd}${queryStr ? '?'+queryStr : ''}`
    let title = `${this.state.host}`;
    if (href !== '/') {
      title += href;
    }
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
          <h1><a href={href}>{title}</a></h1>
          <p>Execute a remote command over HTTP.</p>
          <form
            action={`/${cmd}`}
            method="GET"
            autoComplete="off"
            onChange={this.onChange}
          >
            {
              arg.map(arg => <input type="hidden" name="arg" value={arg} />)
            }
            <p>
              <label>
                <input
                  type="text"
                  autoFocus="on"
                  defaultValue={this.state.command}
                  placeholder="Enter a Command"
                />
              </label>
            </p>
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

          input {
            background-color: transparent;
            border: none;
            color #fff;
            text-align: center;
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
        `}</style>
      </div>
    );
  }
}
