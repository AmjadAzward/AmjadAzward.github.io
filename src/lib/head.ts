export const makeHead = (title: string, description: string, path: string) => () => ({
  meta: [
    { title: `${title} - Amjad Azward` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} - Amjad Azward` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: path },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [{ rel: "canonical", href: path }],
});
