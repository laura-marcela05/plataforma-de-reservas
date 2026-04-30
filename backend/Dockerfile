FROM node:22-alpine

WORKDIR /app

# Parchear paquetes del OS para reducir CVEs de la imagen base
RUN apk upgrade --no-cache

# Configurar zona horaria local en el contenedor
RUN apk add --no-cache tzdata && \
	cp /usr/share/zoneinfo/America/Bogota /etc/localtime && \
	echo "America/Bogota" > /etc/timezone

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN sed -i 's/\r$//' entrypoint.sh

RUN chmod +x entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["sh", "entrypoint.sh"]