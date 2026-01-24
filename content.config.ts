import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    activities: defineCollection({
      type: 'page',
      source: 'activities/*.md',
      schema: z.object({
        image: z.string(),
        title: z.string(),
        date: z.date(),
        price: z.number(),
        tag: z.string().optional(),
      }),
    }),
    news: defineCollection({
      type: 'page',
      source: 'news/*.md',
      schema: z.object({
        image: z.string(),
        title: z.string(),
        date: z.date(),
        teaser: z.string().optional(),
      }),
    }),
    pages: defineCollection({
      type: 'page',
      source: 'pages/*.md',
    }),
    info_: defineCollection({
      type: 'page',
      source: 'info/*.md',
    }),
    stories: defineCollection({
      type: 'page',
      source: 'stories/*.md',
      schema: z.object({
        image: z.string(),
        title: z.string(),
        date: z.date(),
        author: z.string(),
        teaser: z.string().optional(),
      }),
    }),
  },
});
