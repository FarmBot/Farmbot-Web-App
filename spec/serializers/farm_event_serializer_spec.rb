require "spec_helper"

describe FarmEventSerializer do
  let(:farm_event) do
    fe = FactoryGirl.build(:farm_event, start_time: Time.now + 5.days)
    fe.executable = FactoryGirl.build(:regimen, device: fe.device)
    fe.save!
    FactoryGirl.create(:regimen_item, regimen:     fe.executable,
                                      time_offset: 7000)
    fe
  end

  it "renders a regimen" do
    result = FarmEventSerializer.new(farm_event).as_json
    cal = result[:calendar]
    expect(cal.length).to be(1)
    expect(cal.first).to eq(farm_event.start_time.midnight + 7.seconds)
  end

  it "does not render `nil` and friends" do
    farm_event.executable = nil
    expect{ FarmEventSerializer.new(farm_event).as_json }.to raise_error
  end
end
