require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user) { FactoryGirl.create(:user, device: device) }
    let!(:plant) { FactoryGirl.create(:plant_point, device: device).pointer }

    it 'deletes a plant' do
      sign_in user
      b4 = Plant.count
      delete :destroy, params: { id: plant.id }
      expect(response.status).to eq(200)
      expect(Plant.count).to eq(b4 - 1)
    end
  end
end
