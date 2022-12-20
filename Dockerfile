ARG BASEIMAGE_VERSION=latest
FROM registry.cybus.io/cybus/protocol-mapper-base:${BASEIMAGE_VERSION}

WORKDIR /app
COPY ./src ./src/protocols/custom
COPY ./package.json ./src/protocols/custom
COPY ./package-lock.json ./src/protocols/custom

WORKDIR /app/src/protocols/custom
RUN npm install

ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "dev" ] ; then npm install --dev ; fi

WORKDIR /app
ENTRYPOINT ["scripts/entrypoint.sh"]