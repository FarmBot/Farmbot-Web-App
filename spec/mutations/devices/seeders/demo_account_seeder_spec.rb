require "spec_helper"

describe Devices::Seeders::DemoAccountSeeder do
  let(:device) { FactoryBot.create(:device) }

  it "updates stress demo settings before product line seeding" do
    stress_data = instance_double(Devices::Seeders::StressData)

    expect(Devices::Seeders::StressData)
      .to receive(:new)
      .with(device, 250)
      .and_return(stress_data)
    expect(stress_data).to receive(:update_demo_settings)

    described_class
      .new(device)
      .before_product_line_seeder("genesis_xl_1.8_stress_250")
  end

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

  it "rounds seeded soil height coordinates to the nearest 10mm" do
    seeder = described_class.new(device)
    coordinates = [14, 16].cycle
    allow(seeder).to receive(:rand) do |range|
      range.begin.negative? ? -500 : coordinates.next
    end

    seeder.add_soil_height_points("genesis_1.8")

    points = device.generic_pointers.where(name: "Soil Height")
    expect(points.count).to eq(16)
    expect(points.distinct.pluck(:x)).to eq([10.0])
    expect(points.distinct.pluck(:y)).to eq([20.0])
  end
end
