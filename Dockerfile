FROM node:20

WORKDIR /app

COPY . .

# Build frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# Setup backend
WORKDIR /app/server
RUN npm install

CMD ["node", "server.js"]