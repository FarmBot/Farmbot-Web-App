require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'shows a webcam feed- even if you dont have one' do
    sign_in user
    expect(user.device.webcam_feed).to be(nil)
    user.device.update_attributes!(webcam_url: nil)
    get :show, format: :json
    expect(response.status).to eq(200)
    expect(user.device.reload.webcam_feed).to be
    expect(json[:url]).to eq(WebcamFeed::DEFAULT_FEED_URL)
  end
end
