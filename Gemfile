source 'https://rubygems.org'
source 'https://rails-assets.org'

ruby '2.1.1'

gem 'rails', '4.1.0'

#Dokku demands this one.
gem 'rails_12factor'
gem 'ng-rails-csrf'
gem 'mongoid', '~> 4.0.0', github: 'mongoid/mongoid'

#Asset stuff
gem 'sass-rails', github: 'rails/sass-rails'
gem 'coffee-rails'
gem 'font-awesome-rails'
gem 'uglifier'
gem 'high_voltage', '~> 2.1.0'
gem 'haml'
gem 'rails-assets-ng-sortable'

gem 'figaro' # Store secrets the 12 factor way. TODO: Get off of this gem.
gem 'devise', github: 'plataformatec/devise'
gem 'mutations'

group :development, :test do
  gem 'pry'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'jasmine-rails'
end

group :development do
  gem 'metric_fu' # Run this to see where the code smells. metric_fu in terminal
end

group :test do
  gem 'rspec'
  gem 'rspec-rails'
  gem 'simplecov'
  gem 'capybara'
  gem 'launchy' #save_and_open_page while debugging integration tests.
end
