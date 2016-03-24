require 'spec_helper'

describe Api::TokensController do

  include Devise::TestHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user, password: "password") }
    it 'creates a new token' do
      payload = {user: {email: user.email, password: "password"}}
      post :create, payload
      token = json[:token][:unencoded]
      expect(token[:iss]).to eq("http://test.host/")
    end
  end
end
