# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
FROM      node:lts-alpine

# Options:
ARG       NODE_ENV=production
ENV       NODE_ENV=${NODE_ENV}
ENV       DEBUG_PARSER=${DEBUG_PARSER}
ENV       DEBUG_BUDGET_BANKERS=${DEBUG_BUDGET_BANKERS}

# Set the working directory inside the container
WORKDIR   /app

# Copy the package.json and package-lock.json and install the dependencies using yarn
COPY      yarn.lock package.json ./
RUN       yarn install

# Copy configuration files and app folder
COPY      ./src ./src
COPY      ./config.json ./config.json

CMD       ["yarn", "start"]