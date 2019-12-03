require "spec_helper"

describe Api::FoldersController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "shows a folder" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    get :show, params: { id: parent.id }
    expect(response.status).to eq(200)
    [:id, :parent_id, :color, :name].map do |key|
      expect(json.key?(key)).to be(true)
      expect(json[key]).to eq(parent.send(key))
    end
  end

  it "lists folders" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    get :index, params: { id: parent.id }
    expect(response.status).to eq(200)
    expect(json.count).to eq(user.device.folders.count)
    item = json[0]
    [:id, :parent_id, :color, :name].map do |key|
      expect(item.key?(key)).to be(true)
      expect(item[key]).to eq(parent.send(key))
    end
  end

  it "creates a folder" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    input = {
      parent_id: parent.id,
      color: "blue",
      name: "child",
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

  it "validates parent_id at creation time" do
    sign_in user
    input = {
      parent_id: 9999999,
      color: "blue",
      name: "child",
    }
    post :create, body: input.to_json
    expect(response.status).to eq(422)
    expect(json[:folder_id]).to include("ID is not valid")
  end

  it "updates a folder" do
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

  it "deletes a folder" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    delete :destroy, params: { id: parent.id }
    expect(response.status).to eq(200)
  end

  it "prevents deletion of folders in use by a sequence" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    s = FakeSequence.create
    s.update!(folder: parent)
    delete :destroy, params: { id: parent.id }
    expect(response.status).to eq(422)
    expect(json[:in_use]).to include("still contains 1 sequence")
  end

  it "prevents deletion of folders in use by a folder" do
    sign_in user
    parent = Folder.create!(name: "parent", color: "red", device: user.device)
    child = Folder.create!(name: "child",
                           color: "red",
                           device: user.device,
                           parent: parent)
    delete :destroy, params: { id: parent.id }
    expect(response.status).to eq(422)
    expect(json[:in_use]).to include("folder still contains 1 subfolder")
  end
end
