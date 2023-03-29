require 'spec_helper'

describe Api::CurvesController do
  let(:device) { FactoryBot.create(:device) }
  let(:user)   { FactoryBot.create(:user, device: device) }

  include Devise::Test::ControllerHelpers

  it 'creates a curve' do
    sign_in user
    b4 = Curve.count
    input = { name: "My Curve",
              type: "water",
              data: { 1 => 1 }  }
    post :create, body: input.to_json, params: { format: :json }
    expect(response.status).to eq(200)
    expect(Curve.count).to be > b4
    expect(json[:name]).to eq(input[:name])
    expect(json[:type]).to eq(input[:type])
  end

  it 'prevents bad types' do
    sign_in user
    b4 = Curve.count
    input = { name: "My Curve",
              type: "bad",
              data: { 1 => 1 }  }
    post :create, body: input.to_json, params: { format: :json }
    expect(response.status).to eq(422)
    expect(response.body)
    .to include("bad is not valid. Valid options are:")
    expect(Curve.count).to eq(b4)
  end

  it 'lists' do
    sign_in user
    FactoryBot.create_list(:curve, 5, device: device)
    get :index
    expect(json.length).to eq(5)
  end

  it 'updates' do
    sign_in user
    curve = FactoryBot.create(:curve, device: device)
    input = { name: curve.name.reverse }
    put :update,
        body: input.to_json,
        params: { id: curve.id }
    expect(response.status).to eq(200)
    input.keys.map { |key| expect(json[key]).to eq(input[key]) }
  end

  it 'deletes' do
    sign_in user
    curve = FactoryBot.create(:curve, device: device)
    id = curve.id
    delete :destroy, params: { id: curve.id }
    expect(response.status).to eq(200)
    expect(Curve.exists?(id)).to be false
  end

  it 'prevents deletion' do
    sign_in user
    curve = FactoryBot.create(:curve, device: device)
    id = curve.id
    Plant.create!(x: 5,
                  y: 5,
                  z: 5,
                  radius: 50,
                  name: "new",
                  device: user.device,
                  openfarm_slug: "cabbage",
                  pointer_type: "Plant",
                  water_curve_id: id)
    delete :destroy, params: { id: id }
    expect(response.status).to eq(422)
    expect(response.body)
    .to include("Can't delete curve because it is in use by plant 'new'")
    expect(Curve.exists?(id)).to be true
  end

  it 'shows' do
    sign_in user
    curve = FactoryBot.create(:curve, device: device)
    get :show, params: { id: curve.id }
    expect(json[:id]).to eq(curve.id)
  end
end
