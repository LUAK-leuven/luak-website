import type { PageCollections } from '@nuxt/content';

export type ContentDocumentCollection = keyof PageCollections;

export type ContentDocument = PageCollections[ContentDocumentCollection];

/** A document that carries a picture, such as a news item or a story. */
export type PictureDocument = Extract<ContentDocument, { image: string }>;

export async function useContentDocument<C extends ContentDocumentCollection>(
  collection: C,
) {
  const route = useRoute();

  const { data, error } = await useAsyncData(route.path, async () => {
    return (
      (await queryCollection(collection).path(route.path).first()) ?? undefined
    );
  });

  if (error.value) {
    throw error.value;
  }
  if (data.value === undefined) {
    throw showError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
    });
  }
  return data.value;
}
