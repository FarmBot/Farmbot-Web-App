require 'codeclimate-test-reporter'
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
require 'capybara/rails'
require 'capybara/rspec'
require 'features/helpers'
# require 'capybara/poltergeist'
# Capybara.javascript_driver = :poltergeist
Capybara.register_driver :poltergeist do |app|
  # Capybara::Poltergeist::Driver.new(app, phantomjs: Phantomjs.path)
  Capybara::Poltergeist::Driver.new(app, timeout: 300)
  Capybara::Poltergeist::Driver.new(app, js_errors: true)
end
# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

SmarfDoc.config do |c|
  c.template_file = 'api_docs.md.erb'
  c.output_file   = 'api_docs.md'
end

RSpec.configure do |config|

  config.backtrace_exclusion_patterns = [/gems/]

  config.include Helpers
  config.infer_spec_type_from_file_location!
  config.order = 'random'

  if ENV['docs']
    config.after(:each, type: :controller) do
      SmarfDoc.run!(request, response)
    end
  end

  config.after(:suite) do
    SmarfDoc.finish!
    ActiveRecord::Base.subclasses.map(&:delete_all)
  end
end
