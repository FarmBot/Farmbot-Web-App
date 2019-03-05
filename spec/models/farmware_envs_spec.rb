require "spec_helper"

describe FarmwareEnv do
  it 'has a length limit' do
    p = {
      device: FactoryBot.create(:device),
      key: Faker::Games::Pokemon.name,
      value:  "===" * 300
    }
    expect { FarmwareEnv.create!(p) }
      .to raise_error(ActiveRecord::ValueTooLong)
  end
end
