require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user) { FactoryGirl.create(:user, device: device) }
    let!(:point) { FactoryGirl.create(:point, device: device) }

    it 'deletes a point' do
      sign_in user
      b4 = Point.count
      delete :destroy, params: { id: point.id }
      expect(response.status).to eq(200)
      expect(Point.count).to eq(b4 - 1)
    end
  end
end
