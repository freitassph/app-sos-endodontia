# Patches locais de segurança

Tarballs preservam nome/versão/licença do upstream. A versão isolada não distingue a correção local: confira `*.provenance.json`, SHA-256 do tarball/diff e os bytes instalados. Não sobrescreva um tarball alterado sob o mesmo nome: o cache npm pode reutilizar conteúdo anterior. Gere nome imutável, lock e `npm ci --ignore-scripts`; verifique todos os arquivos do arquivo compactado contra node_modules.

- Braces: guarda local de profundidade de parser/compile/expand/stringify, limite fixo 128. `npm run test:dependency-contracts` cobre sintaxe comum, strings profundas e ASTs diretos. Padrões mais profundos são recusados de propósito. Não é release upstream; audit bruto não é suprimido.
- Next/fdir: adaptador auditado é específico da versão fixada. O contrato verifica symlinks e a regra ESLint real. Não aplicar a outra versão sem reteste.
- Vault: remapeador legado usa código upstream PR 244 já adotado pelo Vitest 3, com a coleta e o mocker do Vitest 4 corrigido. `npm run test:coverage-contracts` e `npm run test:coverage` preservam os negativos e os thresholds existentes.

As famílias aplicáveis estão somente no projeto que as usa; o recibo de proveniência identifica cada tarball. Patches não executam lifecycle. Revisão independente cabe ao integrador.
