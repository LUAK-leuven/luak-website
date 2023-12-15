import textfit from "textfit";
export default defineNuxtPlugin(() => {
  return {
    provide: {
      textfit,
    },
  };
});
