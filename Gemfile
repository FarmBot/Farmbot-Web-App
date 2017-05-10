source "https://rubygems.org"
ruby "2.3.3"

gem "rails",  "5.0.0.1"
gem "thin"
gem "rails_12factor"
gem "devise"
gem "jwt"
gem "mutations", "~> 0.8.0"
gem "active_model_serializers", "~> 0.10.0"
gem "rack-cors"
gem "database_cleaner"
gem "rack-attack"
gem "paperclip", "~> 5.0.0"
gem "delayed_job_active_record"
gem "figaro"
gem "fog-google", git: "https://github.com/fog/fog-google"
gem "rest-client" # If you see this, delete this.
gem "pg"
gem "batch_api"
gem "json-schema-generator"
gem "montrose"

# Error reporting tools.
# Active on the "official" FarmBot server, set the appropriate ENV
# vars if you wish to use them on your own servers.
gem "rollbar"
gem "skylight"

group :development, :test do
  gem "pry"
  gem "factory_girl_rails"
  gem "faker"
  gem "smarf_doc", git: "https://github.com/RickCarlino/smarf_doc.git"
  gem "rails-erd"
  gem "rspec"
  gem "rspec-rails"
  gem "simplecov"
  gem "letter_opener"
end
