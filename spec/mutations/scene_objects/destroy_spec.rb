require "spec_helper"

describe SceneObjects::Destroy do
  let(:device) { FactoryBot.create(:device) }

  it "destroys a scene object" do
    scene_object = FactoryBot.create(:scene_object, device: device)
    id = scene_object.id

    result = described_class.run!(device: device, scene_object: scene_object)

    expect(result).to eq("")
    expect(SceneObject.exists?(id)).to be false
  end
end
