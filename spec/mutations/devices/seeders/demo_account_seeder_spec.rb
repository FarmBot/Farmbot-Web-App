require "spec_helper"

describe Devices::Seeders::DemoAccountSeeder do
  let(:device) { FactoryBot.create(:device) }

  it "uses stress data for stress demo product lines" do
    stress_data = instance_double(Devices::Seeders::StressData)

    expect(Devices::Seeders::StressData)
      .to receive(:new)
      .with(device, 250)
      .and_return(stress_data)
    expect(stress_data).to receive(:seed!)

    described_class
      .new(device)
      .after_product_line_seeder("genesis_xl_1.8_stress_250")
  end
end
