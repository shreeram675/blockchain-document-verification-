FROM node:20

# Root
WORKDIR /app

# Copy everything first
COPY . .

# 🔥 Go to frontend
WORKDIR /app/client

# DEBUG (temporary)
RUN ls -la
RUN cat package.json
RUN npm run

# Install + build frontend
RUN npm install
RUN npm run build

# 🔥 Go back to backend
WORKDIR /app

# Install backend deps
RUN npm install

# Start server
CMD ["node", "server.js"]