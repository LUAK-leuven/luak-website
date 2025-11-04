import type { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types';

export interface NewsContent extends MarkdownParsedContent {
  image: string;
  title: string;
  date: Date;
  teaser?: string;
}
export interface ActivityContent extends MarkdownParsedContent {
  image: string;
  title: string;
  date: Date;
  price: number;
  tag: string;
}
