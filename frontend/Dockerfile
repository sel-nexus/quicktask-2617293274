FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf '%s\n' 'pid /var/cache/nginx/nginx.pid;' 'events { worker_connections 1024; }' 'http {' '  include /etc/nginx/mime.types;' '  default_type application/octet-stream;' '  access_log /dev/stdout;' '  error_log /dev/stderr warn;' '  server {' '    listen 8080;' '    server_name _;' '    root /usr/share/nginx/html;' '    index index.html;' '    location = /healthz { access_log off; add_header Content-Type text/plain; return 200 "ok"; }' '    location / { try_files $uri $uri/ /index.html; }' '  }' '}' > /etc/nginx/nginx.conf \
 && chown -R 10001:10001 /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
