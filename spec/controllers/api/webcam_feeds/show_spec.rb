require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'shows webcam feeds' do
    sign_in user
    expect(user.device.webcam_feeds.length).to be(0)
    user.device.update_attributes!(webcam_url: nil)
    2.times do |num|
      x = "feed " + num.to_s
      WebcamFeed.create! name: x, device: user.device, url: num
    end
    get :index, format: :json
    expect(response.status).to eq(200)
    expect(json.length).to eq(2)
    expect(user.device.webcam_feeds.first).to be
    expect(json[0][:url]).to eq(1)
  end
end
