FROM      mhart/alpine-node:16.4.2

# Options:
ARG       NODE_ENV=production
ENV       NODE_ENV $NODE_ENV
ENV       APP_HOME /hello-world

# Install Modules:
WORKDIR   $APP_HOME

# Copy in files:
COPY      . $APP_HOME

RUN       cd /app; npm install
RUN       npm install forever -g


EXPOSE    80
CMD       ["forever", "/app/index.js", "80"]