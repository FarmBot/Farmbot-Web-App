FROM    ruby:2.5
RUN     apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  postgresql \
  postgresql-contrib
RUN     mkdir /farmbot
WORKDIR /farmbot
COPY    . /farmbot
RUN     bundle install

