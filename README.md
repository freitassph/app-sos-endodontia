<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1HKhiul3AuQm9KFYnztKn2YN6Ym3UaVQL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Manutenção de dependências — 23/10/2026

Atualizações limitadas aos manifests, locks e adaptadores de testes necessários. Fontes de produto, conteúdo e estilos permanecem na revisão base remota. A qualificação local não comprova provider, persistência remota ou produção.

Vite passa para 6.4.5 e Vitest para 4.1.12. O import de configuração Vitest e o stub de `scrollIntoView` ficam restritos aos testes. O fork local de braces inclui limites de profundidade e guardas de ciclos; os contratos positivos/negativos estão em `patches/`. O audit bruto mantém três alertas moderados da cadeia postcss-selector-parser; o backport 6.1.5 é verificado sem suprimir o scanner.

### Qualificação local e publicação

Use o Node indicado em `.nvmrc`. Em um clone, `npm ci --include=dev` ou
`npm run setup:hooks` instala o pre-push. Se o clone já usar um hook próprio,
encadeie `.githooks/pre-push` preservando o protocolo de refs recebido pelo
Git. Um push para `main` roda contratos de dependências, testes, tipos,
build, QA responsivo e jornadas de navegador sobre uma cópia isolada do
commit enviado. A atualização fica bloqueada se algum check falhar.

A integração Git da Vercel publica o frontend da branch de produção. Após o
push autorizado, `npm run release:status -- <SHA>` consulta o alias
`sosendo.vercel.app` e confere o ID, estado, projeto e SHA servidos.
A avaliação local usa conteúdo sintético. A validação clínica continua sob
responsabilidade dos revisores do produto.
