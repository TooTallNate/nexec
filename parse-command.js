const assert = require('assert');

function parse(command) {
  const args = [];
  let m;
  let quote;
  let currentArg = '';
  let index = 0;
  const re = /(\s+|\\.|\"|\')/g;
  while (m = re.exec(command)) {
    //console.log(m);
    const part = command.substring(index, m.index);
    currentArg += part;
    index = m.index + m[0].length;
    //console.log(part, index);
    if (/\s+/.test(m[0])) {
      // whitespace, push current arg to args unless inside a quoted string
      if (quote) {
        currentArg += m[0];
      } else {
        if (currentArg.length) {
          args.push(currentArg);
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
          args.push(currentArg);
          currentArg = '';
          quote = null;
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
  if (currentArg.length > 0) {
    args.push(currentArg);
  }
  //console.log(lastPart, index);
  return args;
}


exports = module.exports = parse;
exports.default = parse;

assert.deepEqual(parse('"\'"'), ["'"]);
assert.deepEqual(parse('"  "'), ['  ']);
assert.deepEqual(parse('\'"\''), ['"']);
assert.deepEqual(parse('"" ""'), ['', '']);
assert.deepEqual(parse('"\\"\\""'), ['""']);
assert.deepEqual(parse('echo \\\' \\"'), ['echo', '\'', '"']);
assert.deepEqual(parse('echo foo bar'), ['echo', 'foo', 'bar']);
assert.deepEqual(parse('echo foo bar   '), ['echo', 'foo', 'bar']);
assert.deepEqual(parse(' echo foo bar '), ['echo', 'foo', 'bar']);
assert.deepEqual(parse('sh -c "echo foo"'), ['sh', '-c', 'echo foo']);
assert.deepEqual(parse('echo "foo bar" baz'), ['echo', 'foo bar', 'baz']);
