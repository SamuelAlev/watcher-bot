FROM node:16

LABEL author="Samuel Alev <samuel.alev@protonmail.com>"

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci

# Install Chrome and dumb-init
RUN apt-get update \
  && apt-get install -y dumb-init wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

COPY . .

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "start"]
