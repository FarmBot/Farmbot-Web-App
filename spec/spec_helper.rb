require 'simplecov'
#Ignore anything with the word 'spec' in it. No need to test your tests.
SimpleCov.start{ add_filter '/spec/' }
require 'pry'
# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'capybara/rails'
require 'capybara/rspec'
require 'features/helpers'
# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

RSpec.configure do |config|

  config.include Helpers

  config.after do
    Mongoid.purge!
  end

  config.order = "random"
end

# Moped was making the test output buffer look ugly every time the database was
# purged. These settings stop that.
Mongoid.logger.level = Logger::WARN
Moped.logger.level = Logger::WARN