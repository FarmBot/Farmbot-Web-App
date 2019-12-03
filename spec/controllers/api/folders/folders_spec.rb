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

  it "lists all folders" do
  end

  it "updates a folder" do
    # Create a folder first....
    sign_in user
    old_parent = Folder.create!(name: "B", device: user.device, color: "blue")
    old_params = { name: "B",
                   device: user.device,
                   color: "blue",
                  parent: old_parent }
    folder = Folder.create!(old_params)
    new_params = { name: "C", color: "red", parent_id: nil }
    patch :update,
          body: new_params.to_json,
          params: { format: :json, id: folder.id }
    expect(response.status).to eq(200)
    folder.reload
    expect(folder.parent).to eq(nil)
    expect(folder.color).to eq("red")
    expect(folder.name).to eq("C")
    expect(json[:parent]).to eq(nil)
    expect(json[:color]).to eq("red")
    expect(json[:name]).to eq("C")
  end
end
