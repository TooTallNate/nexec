FROM tootallnate/bashttpd:1.3.0 as base

# Build the static export files
FROM mhart/alpine-node:10.3.0 as static
WORKDIR /usr/src
COPY package.json next.config.js ./
RUN npm install
COPY . .
RUN npm run build

FROM base
# Install some extra CLI tools to invoke
RUN apk add --no-cache jq curl libstdc++
RUN curl -Ls install-node.now.sh | sh -s -- --yes --version=10.4.0
RUN curl -sfSL import.pw > /usr/bin/import && chmod +x /usr/bin/import
RUN npm install --global --unsafe-perm=true semver yaml-cli

COPY bashttpd.conf /etc/bashttpd/
COPY --from=static /usr/src/demo /etc/bashttpd/demo
USER nobody
