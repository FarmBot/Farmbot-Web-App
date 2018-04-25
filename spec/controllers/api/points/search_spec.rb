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
      GenericPointer.destroy_all
      FactoryBot.create(:generic_pointer, device: device, x: 23)
      FactoryBot.create(:generic_pointer, device: device, x: 98)
      post :search, body: {x: 23}.to_json, params: {format: :json }
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:x]).to eq(23)
    end

    it 'allows non-exact matches' do
      sign_in user
      GenericPointer.destroy_all
      created_by = { created_by: "plant-detection" }
      a = FactoryBot.create(:generic_pointer,
                          device: device,
                          meta: created_by)
      b = FactoryBot.create(:generic_pointer,
                          device: device,
                          meta: created_by.merge({color: "red"}))
      c = FactoryBot.create(:generic_pointer,
                          device: device,
                          meta: {})
      post :search, body: { meta: created_by }.to_json, params: {format: :json }
      expect(response.status).to eq(200)
      expect(json).to be_kind_of(Array)
      expect(json.length).to eq(2)
      ids = json.map{ |x| x[:id] }
      expect(ids).to     include(a.id)
      expect(ids).to     include(b.id)
      expect(ids).to_not include(c.id)
    end

    it 'handles result sets where size = 0' do
      sign_in user
      post :search,
            body: { created_by: "plant-detection" }.to_json,
            params: {format: :json }
      expect(response.status).to eq(200)
      expect(json).to be_kind_of(Array)
      expect(json.length).to eq(0)
    end
  end
end
