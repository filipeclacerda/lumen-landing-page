# Lumen — landing page

Landing page estática do [Lumen](https://github.com/filipeclacerda/lumen) — **Seu dinheiro, mais claro.** Um gestor financeiro pessoal privado, local-first e open source.

## Desenvolvimento

Instale as dependências e execute as verificações:

```bash
npm ci
npm run check
```

Para visualizar localmente, sirva a raiz do projeto com qualquer servidor HTTP estático.

## Publicação

O workflow em `.github/workflows/pages.yml` valida os arquivos e publica automaticamente no GitHub Pages para cada push na `main`.

O conteúdo público é uma lista explícita de arquivos estáticos; arquivos de desenvolvimento e instruções internas não são publicados.
