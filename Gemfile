source "https://rubygems.org"
ruby "~> 2.6.5"

gem "active_model_serializers"
gem "bunny"
gem "delayed_job_active_record" # TODO: Get off of SQL backed jobs. Use Redis
gem "delayed_job"
gem "devise"
gem "discard"
gem "font-awesome-rails"
gem "google-cloud-storage", "~> 1.11", require: false
gem "jwt"
gem "mutations"
gem "pg"
gem "rabbitmq_http_api_client"
gem "rack-attack"
gem "rack-cors"
gem "rails_12factor"
gem "rails", "5.2.3" # TODO: Upgrade to Rails 6
gem "redis", "~> 4.0"
gem "request_store"
gem "rollbar"
gem "scenic"
gem "secure_headers"
gem "tzinfo" # For validation of user selected timezone names
gem "valid_url"
gem "zero_downtime_migrations"

group :development, :test do
  gem "climate_control"
  gem "codecov", require: false
  gem "database_cleaner"
  gem "factory_bot_rails"
  gem "faker"
  gem "hashdiff"
  gem "pry-rails"
  gem "pry"
  gem "rspec-rails"
  gem "rspec"
  gem "simplecov"
  gem "smarf_doc", git: "https://github.com/RickCarlino/smarf_doc.git"
end

group :production do
  gem "passenger"
end
