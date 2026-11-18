# AGENTS.md — SOS Endodontia

## Contrato

Aplicação React/Vite/TypeScript de apoio educacional e operacional em endodontia. Não apresentar conteúdo como diagnóstico, prescrição, supervisão clínica ou substituto de avaliação profissional. Preserve fontes, limites e revisão humana de conteúdo médico.

O projeto não contém `.aiox-core`; não exija stories, personas, greetings ou comandos AIOX. Use skills por resultado e carregue apenas arquivos e referências pertinentes. O agente raiz mantém decisões clínicas, dados, segurança e publicação.

## Desenvolvimento

Use `README.md` para escopo e `package.json` para comandos quando necessários; abra apenas componentes afetados. Preserve design e contratos; isole clientes.

```bash
npm run typecheck
npm test
npm run build
```

Para alterações visuais/interativas, rode `npm run qa:responsive` e `npm run qa:browser` quando o ambiente estiver disponível. Valide desktop/mobile, teclado, foco, estados vazios/erro, console e overflow. Um build verde não prova precisão clínica nem deploy.

Não use dados identificáveis de pacientes em fixtures, logs, screenshots ou docs. Commit, push, deploy ou provider externo só quando pedidos; não reconfirme ação solicitada.
