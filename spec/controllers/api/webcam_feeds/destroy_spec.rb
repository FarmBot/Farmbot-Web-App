require 'spec_helper'

describe Api::WebcamFeedsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }

    it 'destroy a webcam feed' do
      sign_in user
      feed = WebcamFeed.create!(device: user.device, name: "x", url: "y")
      before = WebcamFeed.count
      delete :destroy, params: { id: feed.id }
      after = WebcamFeed.count
      expect(response.status).to eq(200)
      expect(before).to be > after
    end
  end
end
