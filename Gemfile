source 'https://rubygems.org'

ruby '2.1.1'

#Dokku demands this one.
gem 'rails_12factor'

gem 'ng-rails-csrf'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.0'

gem 'mongoid', '~> 4.0.0.beta1', github: 'mongoid/mongoid'

gem 'sass-rails'
gem 'coffee-rails'
gem 'uglifier'
gem 'high_voltage', '~> 2.1.0'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

group :development, :test do
  gem 'pry'
  gem 'factory_girl_rails'
  gem 'faker'
end

group :development do
  gem 'metric_fu' # Run this to see where the code smells. metric_fu in terminal
end

gem 'haml'

gem 'figaro' # Store secrets the 12 factor way.

group :test do
  gem 'rspec'
  gem 'rspec-rails'
  gem 'simplecov'
  gem 'capybara'
  gem 'launchy' #save_and_open_page while debugging integration tests.
end

gem 'devise', github: 'plataformatec/devise'
