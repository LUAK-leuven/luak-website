export default defineEventHandler(() => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404 });
  }
  return { supabaseUrl: process.env.SUPABASE_URL ?? '' };
});
