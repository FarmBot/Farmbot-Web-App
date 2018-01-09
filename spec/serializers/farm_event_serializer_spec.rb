require "spec_helper"

describe FarmEventSerializer do
  let(:farm_event) do
    fe = FactoryBot.build(:farm_event, start_time: Time.now + 5.days)
    fe.executable = FactoryBot.build(:regimen, device: fe.device)
    fe.save!
    FactoryBot.create(:regimen_item, regimen:     fe.executable,
                                      time_offset: 7000)
    fe
  end
end
