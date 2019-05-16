FROM ruby:2.6.3
# WHY: We need Postgres 10, not the default (9)
RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add -
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev \
  postgresql postgresql-contrib
RUN     curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN     apt-get install -y nodejs
RUN     mkdir /farmbot
WORKDIR /farmbot
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
COPY    ./Gemfile /farmbot
