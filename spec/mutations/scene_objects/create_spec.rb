require "spec_helper"

describe SceneObjects::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:params) do
    {
      device: device,
      name: "bench",
      texture: "concrete",
      shape: "box",
      color: "#123456",
      x_origin: "home",
      y_origin: "world",
      z_origin: "world",
      x_center: 1,
      y_center: 2,
      z_base: 3,
      x_size: 4,
      y_size: 5,
      z_size: 6,
    }
  end

  it "creates a scene object" do
    scene_object = described_class.run!(params)

    params.each do |key, value|
      expect(scene_object.send(key)).to eq(value)
    end
  end

  it "rejects invalid textures" do
    result = described_class.run(params.merge(texture: "carpet"))

    expect(result.success?).to be false
    expect(result.errors["texture"].message)
      .to include("carpet is not valid. Valid options are:")
  end

  it "rejects invalid shapes" do
    result = described_class.run(params.merge(shape: "cube"))

    expect(result.success?).to be false
    expect(result.errors["shape"].message)
      .to include("cube is not valid. Valid options are:")
  end

  it "rejects invalid x origins" do
    result = described_class.run(params.merge(x_origin: "left"))

    expect(result.success?).to be false
    expect(result.errors["x_origin"].message)
      .to include("left is not valid. Valid options are:")
  end

  it "rejects invalid y origins" do
    result = described_class.run(params.merge(y_origin: "top"))

    expect(result.success?).to be false
    expect(result.errors["y_origin"].message)
      .to include("top is not valid. Valid options are:")
  end

  it "rejects invalid z origins" do
    result = described_class.run(params.merge(z_origin: "bottom"))

    expect(result.success?).to be false
    expect(result.errors["z_origin"].message)
      .to include("bottom is not valid. Valid options are:")
  end
end
