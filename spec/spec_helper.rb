DO_INTEGRATION   = !!ENV["RUN_CAPYBARA"]
ENV["MQTT_HOST"] = "blooper.io"
ENV["OS_UPDATE_SERVER"] = "http://non_legacy_update_url.com"
require "simplecov"
#Ignore anything with the word "spec" in it. No need to test your tests.
SimpleCov.start do
  add_filter "/spec/"
  add_filter "config/initializers"
end

require "codecov"
SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new([
  SimpleCov::Formatter::HTMLFormatter,
  SimpleCov::Formatter::Codecov,
])
require "pry"

ENV["RAILS_ENV"] ||= "test"
require File.expand_path("../../config/environment", __FILE__)
# This is a stub for BunnyRB because we don't want the test suite to connect to
# AMQP for real.
class FakeTransport < Transport
  MOCKED_METHODS = [ # Theses are the "real" I/O inducing methods that must be
    :bind,           # Stubbed out.
    :publish,
    :queue,
    :subscribe,
    :create_channel,
    :connection,
    # :topic,
  ]

  # When you call an AMQP I/O method, instead of doing real I/O, it will deposit
  # the call into the @calls dictionary for observation.
  attr_reader :calls

  MOCKED_METHODS.map do |name|
    # Eval is Evil, but this is pretty quick for testing.
    eval """
      def #{name}(*x)
        key  = #{name.inspect}
        (@calls[key] ||= []).push(x)
        @calls[key] = @calls[key].last(10)
        self
      end
    """
  end

  def initialize(*)
    self.clear!
  end

  def start
    self
  end

  def clear!
    @calls = {}
  end
end

Transport.default_amqp_adapter = FakeTransport
Transport.current = Transport.default_amqp_adapter.new

require "rspec/rails"
require_relative "./stuff"
require_relative "./fake_sequence"

Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

SmarfDoc.config do |c|
  c.template_file = "api_docs.md.erb"
  c.output_file   = "api_docs.md"
end

require "database_cleaner"
DatabaseCleaner.strategy = :truncation
# then, whenever you need to clean the DB
DatabaseCleaner.clean

RSpec.configure do |config|
  if DO_INTEGRATION
    # Do I need to run `env RAILS_ENV=productiono npm run build`?
    require "capybara/rails"
    require "capybara/rspec"
    require "selenium/webdriver"
    # Be sure to run `RAILS_ENV=test rails api:start` and `rails mqtt:start`!
    Capybara.run_server = false
    Capybara.app_host = "http://localhost:3000"
    Capybara.server_host = "localhost"
    Capybara.server_port = "3000"
  end

  config.color = true
  config.fail_fast = 10
  config.backtrace_exclusion_patterns = [/gems/]
  config.filter_run_excluding type: :feature unless DO_INTEGRATION
  config.include Helpers
  config.infer_spec_type_from_file_location!
  config.order = "random"

  if ENV["DOCS"]
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

class NiceResponse
  attr_reader :r, :body

  def initialize(r)
    @r    = r
    @body = r.body.read
  end

  def path
    r.path
  end

  def pretty_url
    r.method + " " + r.path.first(45) + query
  end

  def has_params?
    r.params
     .except(:controller, :action, :format, :id)
     .keys
     .length > 0
  end

  def has_body?
    r.body.size > 4
  end

  def display_body
    begin
      JSON
        .pretty_generate(JSON.parse(body))
        .first(500)
    rescue
      JSON.pretty_generate(r
        .params
        .except(:controller, :action, :format, :id, :user_id, :device_id)).first(500)
    end
  end

  def query
    if r.query_string.present?
      "?" + r.query_string.first(45)
    else
      ""
    end
  end
end
