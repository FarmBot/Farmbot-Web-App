require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user)   { FactoryGirl.create(:user, device: device) }
    let(:point)  {  }

    it 'lists points' do
      sign_in user
      FactoryGirl.create_list(:point, 3, device: device)
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
      expect(json.first.keys).to include(:x)
    end
  end
end
