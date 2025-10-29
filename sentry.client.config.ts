import * as Sentry from "@sentry/nuxt";

Sentry.init({
  dsn: "https://e840882e0d8e35f3822eafca432d8ad8@o4507864074682368.ingest.de.sentry.io/4507864089100368",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
