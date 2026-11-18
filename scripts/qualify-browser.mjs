import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { preview } from 'vite'

const app = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true } })
const run = promisify(execFile)
try {
  const address = app.httpServer.address()
  if (!address || typeof address === 'string') throw new Error('Preview local indisponível.')
  for (const script of ['scripts/qa-responsive-contract.mjs', 'scripts/qa-browser.mjs']) {
    try {
      const { stdout } = await run(process.execPath, [script], {
        env: { ...process.env, QA_URL: `http://127.0.0.1:${address.port}/` },
        maxBuffer: 8 * 1024 * 1024,
      })
      const report = JSON.parse(stdout)
      if (report.status !== 'PASS') throw new Error('O relatório não confirmou PASS.')
      console.log(script, report.status)
    } catch (error) {
      if (error.stderr) process.stderr.write(error.stderr)
      if (error.stdout) process.stderr.write(error.stdout)
      throw error
    }
  }
} finally {
  await app.close()
}
