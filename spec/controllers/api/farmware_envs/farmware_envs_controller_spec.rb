require 'spec_helper'

describe Api::FarmwareEnvsController do
  let(:device) { FactoryBot.create(:device) }
  let(:user)   { FactoryBot.create(:user, device: device) }

  include Devise::Test::ControllerHelpers

  it 'creates a farmware env' do
    sign_in user
    b4 = FarmwareEnv.count
    input = { key: "Coffee Emoji", value: "☕" }
    post :create, params: input
    expect(response.status).to eq(200)
    expect(FarmwareEnv.count).to be > b4
    input.keys.map { |key| expect(json[key]).to eq(input[key]) }
  end

  it 'does not create too many' do
    sign_in user
    FactoryBot.create_list(:farmware_env,
                          Device::DEFAULT_MAX_CONFIGS,
                          device: device)
    b4 = FarmwareEnv.count
    input = { key: "Coffee Emoji", value: "☕" }
    post :create, params: input
    expect(response.status).to eq(422)
    expect(json[:configs]).to include("over the limit")
    expect(FarmwareEnv.count).to eq(b4)
  end

  it 'lists' do
    sign_in user
    FactoryBot.create_list(:farmware_env, 5, device: device)
    get :index
    expect(json.length).to eq(5)
  end

  it 'updates' do
    sign_in user
    farmware_env = FactoryBot.create(:farmware_env, device: device)
    input = { key:   farmware_env.key.reverse,
              value: farmware_env.value.reverse }
    put :update,
        body:   input.to_json,
        params: { id: farmware_env.id }
    expect(response.status).to eq(200)
    input.keys.map { |key| expect(json[key]).to eq(input[key]) }
  end

  it 'deletes' do
    sign_in user
    farmware_env = FactoryBot.create(:farmware_env, device: device)
    id            = farmware_env.id
    delete :destroy, params: { id: farmware_env.id }
    expect(response.status).to eq(200)
    expect(FarmwareEnv.exists?(id)).to be false
  end

  it 'deletes all' do
    sign_in user
    FarmwareEnv.destroy_all
    FactoryBot.create_list(:farmware_env, 3, device: device)
    delete :destroy, params: { id: "all" }
    expect(response.status).to eq(200)
    expect(FarmwareEnv.count).to eq(0)
  end

  it 'shows' do
    sign_in user
    fe = FactoryBot.create(:farmware_env, device: device)
    get :show, params: { id: fe.id }
    expect(json[:id]).to eq(fe.id)
  end
end
