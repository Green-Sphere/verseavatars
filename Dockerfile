# Stage 1: Build the Angular application
FROM node:14 AS builder

WORKDIR /src/app

COPY . .

RUN npm install
RUN npm run build --prod

# Stage 2: Serve the Angular application using nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
