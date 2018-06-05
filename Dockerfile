FROM tootallnate/bashttpd:1.0.1

# Install some extra CLI tools to invoke
USER root
RUN apk add --no-cache jq curl libstdc++
RUN curl -Ls install-node.now.sh | sh -s -- --yes --version=10.2
RUN npm install --global --unsafe-perm semver

COPY bashttpd.conf /etc/bashttpd/
USER bashttpd
