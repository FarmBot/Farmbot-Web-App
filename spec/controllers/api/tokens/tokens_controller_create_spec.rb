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
      expect(token[:iss]).to eq("//localhost:3000")
    end
  end
end
