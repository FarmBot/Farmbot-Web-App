FROM ruby:3.0.2
RUN apt-get update -qq && apt-get install -y lsb-release && \
  curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/apt.postgresql.org.gpg >/dev/null && \
  sh -c 'VERSION_CODENAME=$(lsb_release -cs); echo $VERSION_CODENAME; . /etc/os-release; echo "deb http://apt.postgresql.org/pub/repos/apt/ $VERSION_CODENAME-pgdg main" >> /etc/apt/sources.list.d/pgdg.list' && \
  apt-get update -qq && apt-get install -y build-essential libpq-dev postgresql postgresql-contrib && \
  curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
  sh -c 'echo "\nPackage: *\nPin: origin deb.nodesource.com\nPin-Priority: 700\n" >> /etc/apt/preferences' && \
  apt-get install -y nodejs && \
  mkdir /farmbot;
WORKDIR /farmbot
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
COPY    ./Gemfile /farmbot
