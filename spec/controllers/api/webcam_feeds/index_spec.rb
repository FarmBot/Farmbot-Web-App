require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'shows webcam feeds' do
    sign_in user
    expect(user.device.webcam_feeds.length).to be(0)
    2.times do |num|
      x = "feed " + num.to_s
      WebcamFeed.create! name: x, device: user.device, url: num
    end
    get :index, format: :json
    expect(response.status).to eq(200)
    expect(json.length).to eq(2)
    expect(user.device.webcam_feeds.reload.first).to be
    expect(json.length).to eq(2)
  end
end
