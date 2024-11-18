FROM node:18-alpine
WORKDIR /app
RUN npm install -g ts-node prisma
COPY package*.json ./
RUN npm install
RUN npx prisma init
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
COPY . .
RUN npm run build
RUN mkdir -p /app/logs && touch /app/logs/requests.log
CMD ["npm", "start"]
EXPOSE 3000
