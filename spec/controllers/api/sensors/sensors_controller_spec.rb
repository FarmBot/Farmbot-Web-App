require 'spec_helper'

RSpec.describe Api::SensorsController, type: :controller do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:sensor) do
    FactoryBot.create(:sensor, label: "The old label", device: user.device)
  end

  it "creates a resource" do
    sign_in user
    before = Sensor.count
    post :create,
          body: { pin: 13, label: "LED", mode: 0 }.to_json,
          params: { format: :json }
    expect(response.status).to eq(200)
    expect(json[:pin]).to      eq(13)
    expect(json[:label]).to    eq("LED")
    expect(json[:mode]).to     eq(0)
    expect(before < Sensor.count).to be_truthy
  end

  it "lists all resources" do
    sign_in user
    Sensor.destroy_all
    FactoryBot.create_list(:sensor, 2, device: user.device)
    get :index, params: { format: :json }
    expect(response.status).to eq(200)
    expect(json.length).to  eq(2)
    expect(json.first.keys.sort).to eq([:id, :label, :mode, :pin])
  end

  it "updates a resource" do
    sign_in user
    Sensor.destroy_all
    p = { label: "The new label" }
    put :update, body: p.to_json, params: {id: sensor.id, format: :json }
    expect(response.status).to eq(200)
    expect(json[:label]).to eq(p[:label])
    expect(sensor.reload.label).to eq(p[:label])
  end

  it "destroys a resource" do
    sign_in user
    Sensor.destroy_all
    id = sensor.id
    delete :destroy, params: {id: sensor.id, format: :json }
    expect(response.status).to eq(200)
    expect(Sensor.exists?(id)).to be false
  end
end
