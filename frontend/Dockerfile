# Build stage
FROM node:18-slim AS build
WORKDIR /app
COPY package.json ./
# Since we don't have package-lock.json yet, let's skip it
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Run stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Add custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
