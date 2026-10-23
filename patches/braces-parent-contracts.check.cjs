const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const test = require('node:test');
const root = process.env.DEPENDENCY_ROOT || resolve(__dirname, '..');
const load = createRequire(resolve(root, 'package.json'));
const entry = load.resolve('braces');

test('ASTs com ciclos de um ou dois parents abortam dentro do timeout de 600ms do QA', () => {
  for (const mode of ['self', 'two', 'parent-walk']) {
    const code = `const b=require(${JSON.stringify(entry)});const assert=require('node:assert/strict');
      let a={type:'paren',nodes:[]};
      if (${JSON.stringify(mode)}==='self') a.parent=a;
      else if (${JSON.stringify(mode)}==='two') a.parent={type:'paren',nodes:[],parent:a};
      else a.nodes=[{type:'paren',get nodes(){a.parent=a;return []}}];
      assert.throws(()=>b.expand(a),e=>e instanceof SyntaxError && /parent chain/.test(e.message));`;
    const result = spawnSync(process.execPath, ['-e', code], { encoding:'utf8', timeout:600 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
  }
});

test('cadeia de parents longa aborta e AST normal mantém a expansão', () => {
  const braces = load('braces');
  const a = { type:'paren', nodes:[] }; let p=a;
  for(let i=0;i<130;i++){p.parent={type:'paren',nodes:[]};p=p.parent;}
  assert.throws(()=>braces.expand(a),e=>e instanceof SyntaxError && /parent chain/.test(e.message));
  assert.deepEqual(braces.expand(braces.parse('src/{a,b}/**/*.{js,tsx}')), ['src/a/**/*.js','src/a/**/*.tsx','src/b/**/*.js','src/b/**/*.tsx']);
});
