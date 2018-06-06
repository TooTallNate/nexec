FROM tootallnate/bashttpd:1.1.2 as base

# Build the static export files
FROM mhart/alpine-node:10.3.0 as static
WORKDIR /usr/src
COPY package.json next.config.js ./
RUN npm install
COPY pages ./pages
RUN npm run build

FROM base
# Install some extra CLI tools to invoke
USER root
RUN apk add --no-cache jq curl libstdc++
RUN curl -Ls install-node.now.sh | sh -s -- --yes
RUN npm install --global --unsafe-perm semver

COPY bashttpd.conf /etc/bashttpd/
COPY --from=static /usr/src/demo /etc/bashttpd/demo
USER bashttpd
