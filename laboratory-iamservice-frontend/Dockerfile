# Step 1: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve using NGINX (run app)
FROM nginx:alpine

# Copy Vite dist output to Nginx root
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]