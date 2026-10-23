const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const test = require('node:test');
const load = createRequire(resolve(process.env.DEPENDENCY_ROOT || resolve(__dirname, '..'), 'package.json'));
const braces = load('braces');
const parser = load('postcss-selector-parser');

test('braces preserva expansão, ranges, alternativas, escapes e aspas', () => {
  assert.deepEqual(braces.expand('src/{one,two}/**/*.{js,tsx}'), [
    'src/one/**/*.js', 'src/one/**/*.tsx', 'src/two/**/*.js', 'src/two/**/*.tsx',
  ]);
  assert.deepEqual(braces.expand('{01..03}'), ['01', '02', '03']);
  assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
  assert.deepEqual(braces.expand('x\\{a,b\\}'), ['x{a,b}']);
  assert.deepEqual(braces.expand('"{a,b}"'), ['{a,b}']);
  const ast = braces.parse('{a,b}');
  assert.equal(braces.stringify(ast), '{a,b}');
  assert.equal(new RegExp('^' + braces.compile('{a,b}') + '$').test('a'), true);
  assert.equal(new RegExp('^' + braces.compile('{a,b}') + '$').test('c'), false);
});

test('strings muito aninhadas são recusadas antes dos walkers recursivos', () => {
  for (const pair of [['{', '}'], ['(', ')']]) {
    const pattern = pair[0].repeat(4000) + 'a,b' + pair[1].repeat(4000);
    for (const name of ['parse', 'compile', 'expand', 'stringify']) {
      assert.throws(() => braces[name](pattern), error => error instanceof SyntaxError && /nesting exceeds 128/.test(error.message), name);
    }
  }
});

test('ASTs fornecidos diretamente também respeitam o limite de recursão', () => {
  for (const name of ['compile', 'stringify', 'expand']) {
    const root = { type: 'root', nodes: [] };
    let node = root;
    for (let n = 0; n < 1000; n++) {
      const child = { type: 'brace', nodes: [], parent: node };
      node.nodes.push(child); node = child;
    }
    node.nodes.push({ type: 'text', value: 'a' });
    assert.throws(() => braces[name](root), error => error instanceof SyntaxError && /nesting exceeds 128/.test(error.message), name);
  }
});

test('parser mantém seletores complexos e preserva todos os nós do seletor plano', () => {
  for (const selector of ['.a:is(.b,#c) > [data-x="a,b"]::before', '.hover\\:bg-red:hover', '#{sass}.a', ':not(:where(.a,.b))']) {
    assert.equal(parser().processSync(selector), selector);
  }
  const count = 20000;
  const root = parser().astSync('.a'.repeat(count));
  assert.equal(root.first.nodes.length, count);
  assert.equal(root.toString(), '.a'.repeat(count));
  assert.equal(load('postcss-selector-parser/package.json').version, '6.1.5');
});
