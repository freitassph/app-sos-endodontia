import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
if (!process.env.VERCEL && existsSync(path.join(root, '.git'))) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  const target = path.resolve(root, git('rev-parse', '--git-path', 'hooks/pre-push'))
  const wanted = path.join(root, '.githooks/pre-push')
  const defaultHooks = path.resolve(root, git('rev-parse', '--git-common-dir'), 'hooks/pre-push')
  if (target !== defaultHooks && target !== wanted) throw new Error('Há um core.hooksPath próprio. Integre .githooks/pre-push ao hook existente antes de publicar.')
  if (target !== wanted) {
    const existing = lstatSync(target, {throwIfNoEntry:false})
    if (existing && (!existing.isSymbolicLink() || path.resolve(path.dirname(target), readlinkSync(target)) !== wanted)) {
      throw new Error('Hook pre-push existente preservado. Encadeie .githooks/pre-push antes da publicação.')
    }
    if (!existing) {
      mkdirSync(path.dirname(target), {recursive:true})
      symlinkSync(path.relative(path.dirname(target), wanted), target)
    }
  }
}
