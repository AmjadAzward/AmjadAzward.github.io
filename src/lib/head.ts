const SITE_URL = "https://amjadazward.github.io";
const SOCIAL_IMAGE = `${SITE_URL}/profile-clean.png`;

export const makeHead = (title: string, description: string, path: string) => () => ({
  meta: [
    { title: `${title} - Amjad Azward` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} - Amjad Azward` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}${path}` },
    { property: "og:image", content: SOCIAL_IMAGE },
    { property: "og:image:alt", content: "Amjad Azward's software portfolio" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: SOCIAL_IMAGE },
  ],
  links: [{ rel: "canonical", href: `${SITE_URL}${path}` }],
});
