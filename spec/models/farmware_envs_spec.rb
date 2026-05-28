require "spec_helper"

describe FarmwareEnv do
  it 'has a length limit' do
    p = {
      device: FactoryBot.create(:device),
      key: Faker::Games::Pokemon.name,
      value:  "===" * 334
    }
    expect { FarmwareEnv.create!(p) }.to raise_error(ActiveRecord::ValueTooLong)
  end

  it 'allows string values' do
    env = FarmwareEnv.new(
      device: FactoryBot.create(:device),
      key: Faker::Games::Pokemon.name,
      value: "1",
    )

    expect(env).to be_valid
  end

  it 'does not allow compound values' do
    env = FarmwareEnv.new(
      device: FactoryBot.create(:device),
      key: Faker::Games::Pokemon.name,
      value: { x: "y" },
    )

    expect(env).not_to be_valid
    expect(env.errors[:value]).to include("must be a string")
  end
end
