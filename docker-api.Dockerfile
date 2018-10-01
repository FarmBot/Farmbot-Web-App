FROM    ruby:2.5
RUN     apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  postgresql \
  postgresql-contrib
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN     mkdir /farmbot
WORKDIR /farmbot
COPY    . /farmbot
RUN     bundle install

