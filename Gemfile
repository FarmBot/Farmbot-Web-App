source "https://rubygems.org"
ruby "2.3.2"

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

group :development, :test do
  gem "sqlite3"
  gem "pry"
  gem "factory_girl_rails"
  gem "faker"
  gem "smarf_doc", github: "RickCarlino/smarf_doc"
  gem "rails-erd"
  gem "rspec"
  gem "rspec-rails"
end

group :production do
  gem "pg"
end

group :test do
  gem "simplecov"
end
