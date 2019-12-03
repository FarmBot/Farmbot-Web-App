require "spec_helper"

describe Api::FoldersController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "creates a webcam feed" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    input = {
      parent_id: parent.id,
      color: "blue",
      name: "child"
    }
    b4 = Folder.count
    expect(user.device.folders.count).to eq(1)
    post :create, body: input.to_json
    expect(response.status).to eq(200)
    expect(Folder.count).to be > b4
    expect(user.device.folders.count).to eq(2)
    input.keys.map do |key|
      expect(input[key]).to eq(json[key])
    end
  end
end
