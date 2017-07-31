require 'spec_helper'

describe Api::TokensController do

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user, password: "password") }
    it 'creates a new token' do
      payload = {user: {email: user.email, password: "password"}}
      post :create, params: payload
      token = json[:token][:unencoded]
      expect(token[:iss].last).not_to eq("/") # Trailing slashes are BAD!
      expect(token[:iss]).to include($API_URL)
    end

    it 'handles bad params' do
      err_msg = Api::TokensController::NO_USER_ATTR
      payload = {user: "NOPE!"}
      post :create, params: payload
      expect(json[:error]).to include(err_msg)
    end
  end
end
