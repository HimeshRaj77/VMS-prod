FROM node:22-alpine

WORKDIR /app

# Install OpenSSL for Prisma compatibility on Alpine Linux
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the backend port (assuming 5000 from typical Express setup, adjust if different)
EXPOSE 5000

# Start script - migrations are handled by a wrapper script or docker-compose command
# The start command in package.json is `node index.js`
CMD ["npm", "start"]
