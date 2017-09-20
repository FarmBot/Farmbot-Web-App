require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'creates a webcam feed' do
    sign_in user
    input = { name: "name1", url: "url1" }
    b4 = WebcamFeed.count
    post :create, params: input
    expect(response.status).to eq(200)
    expect(WebcamFeed.count).to be > b4
    expect(user.device.webcam_feeds.count).to eq(1)
    expect(json[:url]).to eq("url1")
    expect(json[:name]).to eq("name1")
  end
end
