FROM tootallnate/bashttpd:1.1.0

# Install some extra CLI tools to invoke
USER root
RUN apk add --no-cache jq curl libstdc++
RUN curl -Ls install-node.now.sh | sh -s -- --yes
RUN npm install --global --unsafe-perm semver

COPY bashttpd.conf /etc/bashttpd/
USER bashttpd
