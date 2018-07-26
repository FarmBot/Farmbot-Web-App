require 'spec_helper'

describe Log do
  class FakeLogDeliveryMailer
    attr_accessor :calls

    def initialize
      @calls = 0
    end

    def log_digest(*)
      self
    end

    def deliver_later(*)
      @calls += 1
      self
    end
  end

  let(:log) do
    FactoryBot.create(:log, channels: ["email"])
  end

  it "has a default wait time for batching" do
    wt = Log.digest_wait_time
    expect(wt).to be_kind_of(Hash)
    expect(wt[:wait]).to eq(30.seconds)
  end

  it "sends routine emails" do
    fdm = FakeLogDeliveryMailer.new
    expect(fdm.calls).to eq(0)
    Log.send_routine_emails(log, log.device, fdm)
    expect(fdm.calls).to eq(1)
  end
end
