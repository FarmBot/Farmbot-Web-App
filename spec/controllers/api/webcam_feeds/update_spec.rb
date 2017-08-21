require 'spec_helper'

describe Api::WebcamFeedsController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

  it 'updates a webcam feed URL' do
    # Create a webcam feed first....
    sign_in user

    input = { url: "/foo.jpg", format: :json }
    patch :update, params: input
    expect(response.status).to eq(200)
    expect(json[:url]).to eq("/foo.jpg")
  end
end
