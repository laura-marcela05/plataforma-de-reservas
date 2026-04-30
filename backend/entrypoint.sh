#!/bin/sh
set -e

# Evita estados inconsistentes de build incremental en volúmenes Docker.
rm -f tsconfig.build.tsbuildinfo
rm -rf dist

echo "⏳ Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "✅ Schema sincronizado. Iniciando backend..."
exec npm run start:dev
