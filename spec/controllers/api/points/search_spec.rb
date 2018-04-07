require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#search' do
    let(:device) { FactoryBot.create(:device) }
    let(:user)   { FactoryBot.create(:user, device: device) }

    it 'queries points' do
      sign_in user
      FactoryBot.create(:generic_pointer, device: device, meta: {foo1: 1})
      FactoryBot.create(:generic_pointer, device: device, meta: {bar2: 2})
      post :search,
           body: {meta: {foo1: 1}}.to_json,
           params: {format: :json }
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:meta].keys).to include(:foo1)

    end

    it 'queries fields other than meta' do
      sign_in user
      FactoryBot.create(:generic_pointer, device: device, x: 23)
      FactoryBot.create(:generic_pointer, device: device, x: 98)
      post :search, body: {x: 23}.to_json, params: {format: :json }
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:x]).to eq(23)
    end
  end
end
