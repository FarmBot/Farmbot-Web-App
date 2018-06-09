require "spec_helper"

describe LogDeliveryMailer, type: :mailer do
    let(:device) { FactoryBot.create(:device) }
    let!(:logs)  { FactoryBot.create(:log, device: device) }

    it "throttles excess requests" do
      Log.max_per_hour = -1 # Throttle it all
      x = LogDeliveryMailer.log_digest(device)
      expect { x.deliver_now }.to raise_error Log::RateLimitError
      Log.max_per_hour = 20
    end
end
