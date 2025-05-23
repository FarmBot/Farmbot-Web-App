DO_INTEGRATION = !!ENV["RUN_CAPYBARA"]
ENV["MQTT_HOST"] = "blooper.io"
# require "deep_cover/builtin_takeover"
require "simplecov"
#Ignore anything with the word "spec" in it. No need to test your tests.
SimpleCov.start do
  add_filter "/spec/"
  add_filter "config/initializers"
end
SimpleCov.coverage_dir("coverage_api")

if ENV["CODECOV_TOKEN"]
  require "simplecov-cobertura"
  SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
    SimpleCov::Formatter::CoberturaFormatter,
  ])
else
  SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
  ])
end
require "pry"
require "webmock/rspec"

ENV["RAILS_ENV"] ||= "test"
require File.expand_path("../../config/environment", __FILE__)

# This is a stub for BunnyRB because we don't want the test suite to connect to
# AMQP for real.
class FakeTransport < Transport
  # Theses are the "real" I/O inducing methods that must be Stubbed out.
  MOCKED_METHODS = [:bind, :create_channel, :publish, :queue,
                    :send_demo_token_to, :subscribe, :topic]

  # When you call an AMQP I/O method, instead of doing real I/O, it will deposit
  # the call into the @calls dictionary for observation.
  attr_reader :calls

  MOCKED_METHODS.map do |name|
    # Eval is Evil, but this is pretty quick for testing.
    eval "def #{name}(*x)
            key  = #{name.inspect}
            (@calls[key] ||= []).push(x)
            @calls[key] = @calls[key].last(10)
            self
          end"
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

require "database_cleaner"
DatabaseCleaner.strategy = :truncation
# then, whenever you need to clean the DB
DatabaseCleaner.clean
Rails.cache.redis.flushdb

RSpec.configure do |config|
  config.color = true
  # config.fail_fast = 10
  config.backtrace_exclusion_patterns = [/gems/]
  config.filter_run_excluding type: :feature unless DO_INTEGRATION
  config.include Helpers
  config.infer_spec_type_from_file_location!
  config.order = "random"
end

FAKE_ATTACHMENT_URL = "https://example.com/image.jpg"

def simulate_fbos_request(version = "17.1.2")
  ua = "FARMBOTOS/#{version} (RPI3) RPI3 (#{version})"
  allow(request).to receive(:user_agent).and_return(ua)
  request.env["HTTP_USER_AGENT"] = ua
end

def run_jobs_now
  delay_jobs = Delayed::Worker.delay_jobs
  Delayed::Worker.delay_jobs = false
  yield
  Delayed::Worker.delay_jobs = delay_jobs
end

def with_modified_env(options, &block)
  ClimateControl.modify(options, &block)
end

# Reassign constants without getting a bunch of warnings to STDOUT.
# This is just for testing purposes, so NBD.
def const_reassign(target, const, value)
  b4 = target.const_get(const)
  target.send(:remove_const, const)
  target.const_set(const, value)
  if block_given?
    yield
    target.send(:remove_const, const)
    target.const_set(const, b4)
  end
end

def destroy_everything!
  Device.update_all(mounted_tool_id: nil)
  [
    Primitive,
    Curve,
    FarmEvent,
    Release,
    WizardStepResult,
    AiFeedback,
    FarmwareEnv,
    Alert,
    Sensor,
    Peripheral,
    Log,
    PinBinding,
    PointGroupItem,
    PointGroup,
    Point,
    TokenIssuance,
    ToolSlot,
    User,
    PlantTemplate,
    SavedGarden,
    SensorReading,
    FarmwareInstallation,
    Tool,
    Telemetry,
    Delayed::Job,
    Delayed::Backend::ActiveRecord::Job,
    Fragment,
    Device,
  ].map(&:delete_all)
end

class StubResp
  attr_accessor :code, :body

  def initialize(code, body)
    @code, @body = code, body
  end
end

class NiceResponse
  attr_reader :r, :body

  def initialize(r)
    @r = r
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

FakeDeliveryInfo = Struct.new(:routing_key, :device)
