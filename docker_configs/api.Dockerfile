FROM ruby:3.3.5
RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/apt.postgresql.org.gpg > /dev/null && \
  sh -c '. /etc/os-release; echo $VERSION_CODENAME; echo "deb http://apt.postgresql.org/pub/repos/apt/ $VERSION_CODENAME-pgdg main" >> /etc/apt/sources.list.d/pgdg.list' && \
  apt-get update -qq && apt-get install -y build-essential libpq-dev postgresql postgresql-contrib && \
  mkdir -p /etc/apt/keyrings && \
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
  sh -c 'echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list' && \
  apt-get update -qq && \
  sh -c 'echo "\nPackage: *\nPin: origin deb.nodesource.com\nPin-Priority: 700\n" >> /etc/apt/preferences' && \
  apt-get install -y nodejs && \
  mkdir /farmbot;
WORKDIR /farmbot
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
COPY    ./Gemfile /farmbot
