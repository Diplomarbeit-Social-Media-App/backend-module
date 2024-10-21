FROM node:18-alpine
WORKDIR /app
RUN npm install -g ts-node prisma
COPY package*.json ./
RUN npm install
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
RUN npm uninstall bcrypt
RUN npm install bcrypt
COPY . .
CMD ["npm", "start"]
EXPOSE 3000
