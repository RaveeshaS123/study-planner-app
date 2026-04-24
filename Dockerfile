# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the application
COPY . .

# Expose port your app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

# Start the app
CMD ["node", "src/app.js"]