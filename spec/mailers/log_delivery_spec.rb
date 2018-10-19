require "spec_helper"

describe LogDeliveryMailer, type: :mailer do
    let(:device) { FactoryBot.create(:device) }

    it "batches logs into digests of a capped size" do
      old_size = LogDeliveryMailer::MAX_PER_DIGEST
      const_reassign(LogDeliveryMailer, :MAX_PER_DIGEST, 2)
      logs = FactoryBot.create_list(:log, 3, device:  device,
                                             type:    "info",
                                             channels: ["email"],
                                             sent_at: nil)
      expect(device.unsent_routine_emails.length).to eq(3)
      run_jobs_now do
        msg = LogDeliveryMailer.log_digest(device).body.encoded
        expect(msg).to include(logs[0].message)
        expect(msg).to include(logs[1].message)
        expect(msg).not_to include(logs[2].message)
      end
      const_reassign(LogDeliveryMailer, :MAX_PER_DIGEST, old_size)
    end
end
