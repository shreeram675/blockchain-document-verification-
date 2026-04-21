# Use Node.js
FROM node:20

# Root
WORKDIR /app

# Copy everything
COPY . .

# 🔥 Build frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# 🔥 Install backend dependencies
WORKDIR /app/server
RUN npm install

# Expose port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]