require "spec_helper"

describe SceneObjects::Update do
  let(:device) { FactoryBot.create(:device) }
  let(:scene_object) { FactoryBot.create(:scene_object, device: device) }
  let(:params) { { device: device, scene_object: scene_object } }

  it "updates a scene object" do
    result = described_class.run!(params.merge(name: "desk", z_size: 200))

    expect(result).to eq(scene_object)
    expect(result.reload.name).to eq("desk")
    expect(result.z_size).to eq(200)
  end

  it "updates texture, shape, and origins" do
    result = described_class.run!(
      params.merge(texture: "grass",
                   shape: "sphere",
                   x_origin: "max",
                   y_origin: "home",
                   z_origin: "world")
    )

    expect(result.reload.texture).to eq("grass")
    expect(result.shape).to eq("sphere")
    expect(result.x_origin).to eq("max")
    expect(result.y_origin).to eq("home")
    expect(result.z_origin).to eq("world")
  end

  it "rejects invalid texture, shape, and origins" do
    result = described_class.run(
      params.merge(texture: "paper",
                   shape: "pyramid",
                   x_origin: "east",
                   y_origin: "north",
                   z_origin: "bottom")
    )

    expect(result.success?).to be false
    expect(result.errors["texture"].message)
      .to include("paper is not valid. Valid options are:")
    expect(result.errors["shape"].message)
      .to include("pyramid is not valid. Valid options are:")
    expect(result.errors["x_origin"].message)
      .to include("east is not valid. Valid options are:")
    expect(result.errors["y_origin"].message)
      .to include("north is not valid. Valid options are:")
    expect(result.errors["z_origin"].message)
      .to include("bottom is not valid. Valid options are:")
  end

  it "does not pass excluded fields to update" do
    expect(scene_object).to receive(:update!) do |attributes|
      expect(attributes).to eq("name" => "chair")
      true
    end

    described_class.run!(params.merge(name: "chair"))
  end
end
