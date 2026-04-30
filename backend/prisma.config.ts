import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Carga el .env desde la raíz del proyecto (afuera de backend)
config({ path: path.join(__dirname, '..', '.env') });

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      return new PrismaPg({
        connectionString: process.env.DATABASE_URL as string,
      });
    },
  },
});