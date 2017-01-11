source "https://rubygems.org"
ruby "2.3.3"

gem "rails",  "5.0.0.1"
gem "thin"
gem "rails_12factor"
gem "devise"
gem "jwt"
gem "mutations"
gem "active_model_serializers", "~> 0.8.3"
gem "ice_cube"
gem "rack-cors"
gem "mysql"
gem "database_cleaner"
gem "rollbar"
gem "rack-attack"
gem "paperclip", "~> 5.0.0"

group :development, :test do
  gem "sqlite3"
  gem "pry"
  gem "factory_girl_rails"
  gem "faker"
  gem "smarf_doc", git: "https://github.com/RickCarlino/smarf_doc.git"
  gem "rails-erd"
  gem "rspec"
  gem "rspec-rails"
end

group :production do
  # For Heroku users:
  gem "pg"
  # For Dokku users:
  # TODO: Remove MySQL completly and update Dokku deployment instructions.
  gem "mysql2"
end

group :test do
  gem "simplecov"
end
