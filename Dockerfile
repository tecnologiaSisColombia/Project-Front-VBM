FROM nginx:1.23.3

EXPOSE 80

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist/marchiquita-front/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
