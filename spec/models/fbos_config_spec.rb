require 'spec_helper'

describe FbosConfig do
    let(:device) { FactoryBot.create(:device)         }
    let(:config) { FbosConfig.create!(device: device) }

    it 'triggers callbacks' do
      pending "Probably can be removed."
      serial_number = SecureRandom.hex.first(8)
      channel       = "beta"
      msg           = :push_changes_to_nerves_hub

      DeviceSerialNumber.create!(device: device, serial_number: serial_number)
      expect(config).to receive(msg).with(serial_number, channel)
      run_jobs_now do
        config.update_attributes!(update_channel: channel)
      end
    end
end
