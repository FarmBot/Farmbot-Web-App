FROM ruby:2.5
RUN apt-get update -qq && apt-get install -y \
 build-essential \
 libpq-dev \
 postgresql \
 postgresql-contrib
RUN     curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN     apt-get install -y nodejs
RUN     mkdir /farmbot
WORKDIR /farmbot
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
COPY    ./Gemfile /farmbot
