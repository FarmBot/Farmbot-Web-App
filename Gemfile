source 'https://rubygems.org'
source 'https://rails-assets.org'
ruby '2.2.0'

gem 'rails',  '4.1.0'

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
gem 'devise', github: 'plataformatec/devise'
gem 'mutations'
gem 'active_model_serializers', '~> 0.8.3'
gem 'ice_cube'

gem 'rails-assets-angular', '~> 1.3'
gem 'rails-assets-ng-sortable'
gem 'rails-assets-js-data'
gem 'rails-assets-js-data-angular'
gem 'rails-assets-lodash'
gem 'rails-assets-jquery'
gem 'rails-assets-pickadate'
gem 'rails-assets-ng-pickadate'
gem 'rails-assets-sio-client'

group :development, :test do
  gem 'pry'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'jasmine-rails'
  gem 'smarf_doc', github: 'RickCarlino/smarf_doc'
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
  gem 'capybara-angular' # Avoid race conditions in angular integration tests
  gem 'poltergeist'
  gem 'phantomjs'
  gem 'codeclimate-test-reporter', require: nil
end
