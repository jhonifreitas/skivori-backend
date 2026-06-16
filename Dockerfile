FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN yarn prisma:generate && yarn build

FROM node:24-alpine AS runner
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

EXPOSE 3333
CMD [ "yarn", "start:prod" ]