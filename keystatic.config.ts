import { config, fields, collection } from "@keystatic/core";

// Auto-detecta: github quando as env vars estiverem setadas, local caso contrário.
// Quando quiser ativar modo github:
// 1. Crie um GitHub App (https://keystatic.com/docs/github-mode)
// 2. Adicione ao .env.local:
//    KEYSTATIC_GITHUB_CLIENT_ID=...
//    KEYSTATIC_GITHUB_CLIENT_SECRET=...
//    KEYSTATIC_SECRET=...
// 3. Rebuild e acesse /keystatic
const isGithubMode = !!process.env.KEYSTATIC_GITHUB_CLIENT_ID;

export default config({
  storage: isGithubMode
    ? { kind: "github" as const, repo: "isaacrdglost/contadev" }
    : { kind: "local" as const },

  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Título", validation: { isRequired: true } },
        }),
        description: fields.text({
          label: "Descrição",
          multiline: true,
          validation: { isRequired: true },
        }),
        publishedAt: fields.date({
          label: "Data de publicação",
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Rascunho", value: "draft" },
            { label: "Publicado", value: "published" },
          ],
          defaultValue: "draft",
        }),
        content: fields.document({
          label: "Conteúdo",
          formatting: true,
          dividers: true,
          links: true,
          images: undefined,
        }),
      },
    }),
  },
});
