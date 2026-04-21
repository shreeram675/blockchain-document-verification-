FROM node:20

# Set working directory
WORKDIR /app

# Copy package files (backend)
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .

# 🔥 Build frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# Go back to root
WORKDIR /app

# Start server
CMD ["node", "server.js"]