FROM ruby:4.0.3
RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/apt.postgresql.org.gpg > /dev/null
RUN sh -c '. /etc/os-release; echo $VERSION_CODENAME; echo "deb http://apt.postgresql.org/pub/repos/apt/ $VERSION_CODENAME-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev postgresql postgresql-contrib lcov
RUN mkdir /farmbot
WORKDIR /farmbot
ENV     BUN_INSTALL=/root/.bun
RUN     curl -fsSL https://bun.sh/install | bash
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
ENV     PATH="${BUN_INSTALL}/bin:${BUNDLE_BIN}:${PATH}"
COPY    ./Gemfile /farmbot
