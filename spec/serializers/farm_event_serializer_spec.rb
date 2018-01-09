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

  it "does not render `nil` and friends" do
    farm_event.executable = nil
    expect{
      FarmEventSerializer.new(farm_event).as_json
    }.to raise_error(UncaughtThrowError)
  end
end
