require "spec_helper"

describe Devices::Seeders::StressData do
  let(:device) { FactoryBot.create(:device) }

  it "maps stress product lines to row counts" do
    expect(described_class.count_for("genesis_xl_1.8_stress_250")).to eq(250)
    expect(described_class.count_for("genesis_xl_1.8_stress_500")).to eq(500)
    expect(described_class.count_for("genesis_xl_1.8_stress_750")).to eq(750)
    expect(described_class.count_for("genesis_xl_1.8_stress_1000")).to eq(1_000)
    expect(described_class.count_for("genesis_xl_1.8")).to be_nil
  end

  it "adds stress resources", :slow do
    device.web_app_config.update!(map_size_x: 5_900, map_size_y: 2_730)

    described_class.new(device, 3).seed!

    expect(device.plants.count).to eq(3)
    expect(device.generic_pointers.where(name: "Soil Height").count).to eq(3)
    expect(device.points.where(pointer_type: "Weed").count).to eq(3)
    expect(device.images.count).to eq(3)
    expect(device.images.first.meta).to include(
      x: be_a(Integer),
      y: be_a(Integer),
      z: 0,
      name: "Stress Image 1",
    )
    expect(device.images.all? { |image| image.attachment.attached? }).to be(true)
    expect(device.sensor_readings.count).to eq(3)
    expect(device.sensor_readings.pluck(:pin).uniq).to eq([59])
    expect(device.sensor_readings.pluck(:mode).uniq)
      .to eq([CeleryScriptSettingsBag::ANALOG])
  end

  it "updates stress demo display settings" do
    described_class.new(device, 3).update_demo_settings

    expect(device.reload.max_images_count).to eq(3)
    expect(device.web_app_config.show_sensor_readings).to be(true)
    expect(device.web_app_config.show_moisture_interpolation_map).to be(true)
    expect(device.web_app_config.three_d_garden).to be(true)
  end
end
