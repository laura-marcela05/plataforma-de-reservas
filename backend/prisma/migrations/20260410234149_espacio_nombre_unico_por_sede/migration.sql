/*
  Warnings:

  - A unique constraint covering the columns `[sedeId,nombre]` on the table `espacios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "espacios_sedeId_nombre_key" ON "espacios"("sedeId", "nombre");
