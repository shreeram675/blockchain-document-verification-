FROM node:20

WORKDIR /app

# Copy everything
COPY . .

# 🔥 Build frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# 🔥 Install backend deps
WORKDIR /app
RUN npm install

# Start server
CMD ["node", "server.js"]