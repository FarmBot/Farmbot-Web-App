require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#search' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user)   { FactoryGirl.create(:user, device: device) }

    it 'queries points' do
      sign_in user
      FactoryGirl.create(:point, device: device, meta: {foo1: 1})
      FactoryGirl.create(:point, device: device, meta: {bar2: 2})
      post :search,
           body: {meta: {foo1: 1}}.to_json,
           params: {format: :json }
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:meta].keys).to include(:foo1)

    end
  end
end
