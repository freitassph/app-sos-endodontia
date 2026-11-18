import { execFileSync } from 'node:child_process'
const sha = process.argv[2]
if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Informe o SHA completo qualificado.')
const api = path => JSON.parse(execFileSync('vercel', ['api', path, '--scope', 'pedro-henrique-m-freitas-projects'], { encoding: 'utf8' }))
const domain = 'sosendo.vercel.app'
const alias = () => api('/v4/aliases/' + domain)
const bound = alias()
if (bound.alias !== domain || bound.projectId !== 'prj_ZM50s0vHk78vOtu7y862VED2UfLT' || !bound.deploymentId) {
  throw new Error('O domínio de produção não confirmou o projeto SOS.')
}
const release = api('/v13/deployments/' + bound.deploymentId)
if (release.id !== bound.deploymentId || (release.projectId ?? release.project?.id) !== bound.projectId || release.target !== 'production' ||
    release.readyState !== 'READY' || release.meta?.githubCommitSha !== sha || alias().deploymentId !== release.id) {
  throw new Error('O domínio de produção ainda não confirmou o deployment e o commit esperados.')
}
console.log(domain, release.id, sha, 'READY')
