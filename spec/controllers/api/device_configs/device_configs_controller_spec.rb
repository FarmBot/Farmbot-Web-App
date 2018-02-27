require 'spec_helper'

describe Api::DeviceConfigsController do
  let(:device) { FactoryBot.create(:device) }
  let(:user)   { FactoryBot.create(:user, device: device) }

  include Devise::Test::ControllerHelpers

  it 'creates a device config' do
    sign_in user
    b4 = DeviceConfig.count
    input = { key: "Coffee Emoji", value: "☕" }
    post :create, params: input
    expect(response.status).to eq(200)
    expect(DeviceConfig.count).to be > b4
    input.keys.map { |key| expect(json[key]).to eq(input[key]) }
  end

  it 'lists' do
    sign_in user
    FactoryBot.create_list(:device_config, 5, device: device)
    get :index
    expect(json.length).to eq(5)
  end

  it 'updates' do
    sign_in user
    device_config = FactoryBot.create(:device_config, device: device)
    input = { key:   device_config.key.reverse,
              value: device_config.value.reverse }
    put :update,
        body:   input.to_json,
        params: { id: device_config.id }
    expect(response.status).to be(200)
    input.keys.map { |key| expect(json[key]).to eq(input[key]) }
  end

  it 'deletes' do
    sign_in user
    device_config = FactoryBot.create(:device_config, device: device)
    id            = device_config.id
    delete :destroy, params: { id: device_config.id }
    expect(response.status).to be(200)
    expect(DeviceConfig.exists?(id)).to be false
  end
end
