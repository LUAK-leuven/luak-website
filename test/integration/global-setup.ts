import { setup } from '@nuxt/test-utils/e2e';
import { configDotenv } from 'dotenv';

configDotenv({ path: '.env.local', quiet: true });

await setup({ host: 'http://localhost:3000' });
