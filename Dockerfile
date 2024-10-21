FROM node:18-alpine
WORKDIR /app
RUN npm install -g ts-node prisma
COPY package*.json ./app
RUN npm install
COPY prisma/schema.prisma ./app/prisma/schema.prisma
RUN npx prisma generate
RUN npm uninstall bcrypt
RUN npm install bcrypt
COPY . .
CMD ["npm", "start"]
EXPOSE 3000
