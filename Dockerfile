FROM nginx:1.27-alpine
ENV PORT=8080
COPY public/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 8080
