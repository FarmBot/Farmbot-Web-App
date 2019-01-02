require 'spec_helper'

describe FbosConfig do
    let(:device) { FactoryBot.create(:device) }
    it 'triggers callbacks' do
      config = FbosConfig.create!(device: device)
      config.update_attributes!(update_channel: "beta")
      binding.pry
    end
end
