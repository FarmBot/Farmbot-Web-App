require "spec_helper"

describe DeviceConfig do
  it 'has a length limit' do
    p = {
      device: FactoryBot.create(:device),
      key: Faker::Pokemon.name,
      value:  "===" * 300
    }
    expect { DeviceConfig.create!(p) }
      .to raise_error(ActiveRecord::ValueTooLong)
  end
end
