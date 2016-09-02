source 'https://rubygems.org'
ruby '2.3.1'

gem 'rails',  '4.2.7'

#Dokku demands this one.
gem 'rails_12factor'
gem 'ng-rails-csrf'

#Asset stuff
gem 'sprockets'
gem 'sass-rails'
gem 'coffee-rails'
gem 'font-awesome-rails'
gem 'uglifier'
gem 'high_voltage', '~> 2.1.0'
gem 'haml'
gem 'devise', github: 'plataformatec/devise'
gem 'jwt'
gem 'mutations'
gem 'active_model_serializers', '~> 0.8.3'
gem 'ice_cube'
gem 'rack-cors', require: 'rack/cors'
gem 'haikunator' # For cool bot names.

source 'https://rails-assets.org' do
  gem 'rails-assets-lodash'
  gem 'rails-assets-jquery'
end

group :development, :test do
  gem "bullet"
  gem 'metric_fu' # Run this to see where the code smells. metric_fu in terminal  
  gem 'pry'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'smarf_doc', github: 'RickCarlino/smarf_doc'
  gem 'sqlite3'
end

group :test do
  gem 'rspec'
  gem 'rspec-rails'
  gem 'simplecov'
  gem 'capybara'
  gem 'launchy' #save_and_open_page while debugging integration tests.
  gem 'selenium-webdriver'
  gem 'codeclimate-test-reporter', require: nil
end
