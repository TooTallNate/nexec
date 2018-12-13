const assert = require('assert');

export default function parse(command) {
  const args = [];
  let m;
  let quote;
  let quoteJustEnded = false;
  let currentArg = '';
  let index = 0;
  const re = /(\s+|\\.|\"|\')/g;
  while (m = re.exec(command)) {
    //console.log(m);
    const part = command.substring(index, m.index);
    currentArg += part;
    index = m.index + m[0].length;
    if (/\s+/.test(m[0])) {
      // whitespace, push current arg to args unless inside a quoted string
      if (quote) {
        currentArg += m[0];
      } else {
        if (quoteJustEnded || currentArg.length) {
          args.push(currentArg);
          quoteJustEnded = false;
        }
        currentArg = '';
      }
    } else if (m[0][0] === '\\') {
      // escape character, add next value to current arg
      currentArg += m[0].substring(1);
    } else if (m[0] === '"' || m[0] === "'") {
      if (quote) {
        if (quote === m[0]) {
          // end of arg
          quote = null;
          quoteJustEnded = true;
        } else {
          currentArg += m[0];
        }
      } else {
        quote = m[0];
      }
    } else {
      //console.log(m)
    }
  }
  const lastPart = command.substring(index);
  currentArg += lastPart;
  if (quoteJustEnded || currentArg.length) {
    args.push(currentArg);
  }
  return args;
}

assert.deepEqual(parse('"\'"'), ["'"]);
assert.deepEqual(parse('"  "'), ['  ']);
assert.deepEqual(parse('\'"\''), ['"']);
assert.deepEqual(parse('"" ""'), ['', '']);
assert.deepEqual(parse('"\\"\\""'), ['""']);
assert.deepEqual(parse('ec""ho'), ['echo']);
assert.deepEqual(parse('echo \\\' \\"'), ['echo', '\'', '"']);
assert.deepEqual(parse('echo foo bar'), ['echo', 'foo', 'bar']);
assert.deepEqual(parse('echo foo bar   '), ['echo', 'foo', 'bar']);
assert.deepEqual(parse(' echo foo bar '), ['echo', 'foo', 'bar']);
assert.deepEqual(parse('sh -c "echo foo"'), ['sh', '-c', 'echo foo']);
assert.deepEqual(parse('echo "foo bar" baz'), ['echo', 'foo bar', 'baz']);
