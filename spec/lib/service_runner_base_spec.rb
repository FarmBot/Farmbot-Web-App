require "spec_helper"
require "service_runner_base"

describe ServiceRunner do
  class ServiceRunnerStub
    attr_accessor :subscribe_call_count, :process_calls

    MSG = RuntimeError.new("First attempt will fail, expect a retry")

    def initialize
      @subscribe_call_count = 0
      @process_calls        = []
    end

    def subscribe(*)
      @subscribe_call_count = @subscribe_call_count + 1
      (@subscribe_call_count > 1) ? yield({}, {}, "blah") : (raise MSG)
    end

    def process(*args)
      process_calls.push(args)
    end
  end

  it "reports errors to rollbar and retries" do
    stub = ServiceRunnerStub.new
    expect(Rollbar).to receive(:error).with(ServiceRunnerStub::MSG)
    ServiceRunner.go!(stub, stub)
    expect(stub.subscribe_call_count).to eq(2)
    expect(stub.process_calls.count).to eq(1)
    expect(stub.process_calls.first[0]).to eq({})
    expect(stub.process_calls.first[1]).to be_kind_of(String)
    expect(stub.process_calls.first[1].encoding.to_s).to eq("UTF-8")
  end
end
