# FROM node:18.16.0-alpine as base
# COPY package.json ./
# RUN npm install
# COPY src ./src
# COPY tsconfig.json ./tsconfig.json
# RUN npm run build
# FROM node:18.16.0-alpine

# COPY --from=base ./node_modules ./node_modules
# COPY --from=base ./package.json ./package.json
# COPY --from=base /dist /dist

# EXPOSE 3000
# CMD ["npm", "run", "start"]

# Use official Node.js image as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install ts-node globally
RUN npm install -g ts-node

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Start the server using ts-node with tsconfig-paths
CMD ["ts-node", "-r", "tsconfig-paths/register", "src/index.ts"]

# Expose the application port
EXPOSE 3000