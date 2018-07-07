require "spec_helper"

describe TokenIssuance do
  it "notifies admins about failed message queue evictions" do
    allow(Transport::Mgmt)
      .to receive(:connections).and_raise(Faraday::ConnectionFailed, "rspec")
    allow(Rollbar).to receive(:error).and_return("OK")
    TokenIssuance.new(device_id: 8).maybe_evict_clients
  end
end
