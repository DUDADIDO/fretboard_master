# 1단계: React/Vite 빌드
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


# 2단계: 정적 파일 서빙
FROM nginx:alpine

# 베이스 이미지보다 새로 나온 Alpine 보안 패치 반영 (공식 nginx 이미지가 늦게 갱신될 때 대비)
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]