FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --prod

FROM nginx:1.23.3

EXPOSE 80

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/marchiquita-front/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]