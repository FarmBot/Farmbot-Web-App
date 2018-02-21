ENV['MQTT_HOST'] = "blooper.io"
ENV['OS_UPDATE_SERVER'] = "http://non_legacy_update_url.com"
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require_relative './stuff'
require_relative './topic_stub'
require_relative './nice_response'

ENV['MQTT_HOST'] = "blooper.io"
ENV['OS_UPDATE_SERVER'] = "http://non_legacy_update_url.com"
require 'simplecov'
#Ignore anything with the word 'spec' in it. No need to test your tests.
SimpleCov.start do
  add_filter '/spec/'
  add_filter 'config/initializers'
end

require 'codecov'
SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new([
  SimpleCov::Formatter::HTMLFormatter,
  SimpleCov::Formatter::Codecov,
])
require 'pry'

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require_relative './stuff'

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
  config.color = true
  config.fail_fast = 10
  config.backtrace_exclusion_patterns = [/gems/]

  config.include Helpers
  config.infer_spec_type_from_file_location!
  config.order = 'random'

  if ENV['DOCS']
    config.after(:each, type: :controller) do
      SmarfDoc.run!(NiceResponse.new(request), response)
    end

    config.after(:suite) do
      SmarfDoc.finish!
    end
  end
end

def run_jobs_now
  delay_jobs = Delayed::Worker.delay_jobs
  Delayed::Worker.delay_jobs = false
  yield
  Delayed::Worker.delay_jobs = delay_jobs
end

# Reassign constants without getting a bunch of warnings to STDOUT.
# This is just for testing purposes, so NBD.
def const_reassign(target, const, value)
  target.send(:remove_const, const)
  target.const_set(const, value)
end
