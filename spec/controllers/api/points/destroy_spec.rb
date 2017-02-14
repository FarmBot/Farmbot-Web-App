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

    it 'performs batch deletion' do
      sign_in user
      points       = FactoryGirl.create_list(:point, 6, device: user.device)
      before_count = Point.count
      delete :destroy, params: { id: points.map(&:id).join(",") }
      expect(Point.count).to eq(before_count - 6)
    end
  end
end
