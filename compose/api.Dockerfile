FROM    ruby:2.5.1
RUN     apt-get update && apt-get install -y build-essential nodejs imagemagick
RUN     mkdir -p /farmbot_api
WORKDIR /farmbot_api
COPY    . /farmbot_api
RUN     gem install bundler && bundle install --jobs 20 --retry 5
EXPOSE  3000
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
