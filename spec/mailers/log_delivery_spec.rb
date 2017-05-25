require "spec_helper"

describe LogDeliveryMailer, type: :mailer do
    let(:device)          { FactoryGirl.create(:device) }
    let!(:log_dispatches) { FactoryGirl.create(:log_dispatch, device: device) }

    it "throttles excess requests" do
      LogDispatch.max_per_hour = -1 # Throttle it all
      x = LogDeliveryMailer.log_digest(device)
      expect { x.deliver_now }.to raise_error LogDispatch::RateLimitError
      LogDispatch.max_per_hour = 20
    end
end
