import Head from 'next/head';

const onSubmit = async e => {
  e.preventDefault();
  console.log(e);
  const res = await fetch(`/ls`);
  const body = await res.text();
  console.log(body);
};

export default props => {
  return (
    <div id="root">
      <Head>
        <title>nexec</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, user-scalable=no"
          key="viewport"
        />
        <link href="https://sf.n8.io/?weight=100,200" rel="stylesheet" />
      </Head>

      <div id="content">
        <h1>nexec</h1>
        <p>Execute a remote command over HTTP.</p>
        <form onSubmit={onSubmit}>
          <p>
            <label>
              Command:
              <input type="text" name="command" defaultValue="" />
            </label>
          </p>
          <p>
            <label>
              STDIN URL:
              <input type="text" name="stdin_url" defaultValue="" />
            </label>
          </p>
          <input type="submit" value="Run" />
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

        h1,
        h2 {
          margin: 0;
          font-weight: 200;
        }

        h1 {
          font-size: 3em;
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
};
