require 'codeclimate-test-reporter'
ENV['MQTT_HOST'] = "blooper.io"
ENV['OS_UPDATE_SERVER'] = "http://blah.com"
ENV['FW_UPDATE_SERVER'] = "http://test.com"
CodeClimate::TestReporter.start
require 'simplecov'
#Ignore anything with the word 'spec' in it. No need to test your tests.
SimpleCov.start do
  add_filter '/spec/'
  add_filter 'config/initializers'
end
require 'pry'
# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require 'features/helpers'

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

SmarfDoc.config do |c|
  c.template_file = 'api_docs.md.erb'
  c.output_file   = 'api_docs.md'
end

require 'database_cleaner'
DatabaseCleaner.strategy = :truncation
# then, whenever you need to clean the DB
DatabaseCleaner.clean

RSpec.configure do |config|

  config.backtrace_exclusion_patterns = [/gems/]

  config.include Helpers
  config.infer_spec_type_from_file_location!
  config.order = 'random'

  if ENV['docs']
    config.before(:each, type: :controller) do
      SmarfDoc.run!(request, response)
    end
  end

  config.after(:suite) do
    SmarfDoc.finish!
  end
end
