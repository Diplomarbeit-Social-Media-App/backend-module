FROM node:18-alpine
WORKDIR /app
RUN npm install -g ts-node prisma
COPY package*.json ./
RUN npm install
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY . .
CMD ["ts-node", "-r", "tsconfig-paths/register", "src/index.ts"]
EXPOSE 3000
