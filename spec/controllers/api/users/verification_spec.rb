require 'spec_helper'

describe Api::UsersController do
  let(:user) { FactoryGirl.create(:user, confirmed_at: nil) }
  include Devise::Test::ControllerHelpers

    it 'creates a new user' do
      params =  { token: user.confirmation_token }
      expect(user.confirmed_at).to eq(nil)
      put :verify, params: params
      user.reload
      expect(user.verification_token).to eq(params[:token])
      expect(user.verified_at).to be
      expect(user.verified_at - Time.now).to be < 3
    end
end
