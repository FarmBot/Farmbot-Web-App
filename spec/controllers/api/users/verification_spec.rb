require 'spec_helper'

describe Api::UsersController do
  let(:user) { FactoryBot.create(:user, confirmed_at: nil) }
  include Devise::Test::ControllerHelpers

    it 'creates a new user' do
      pending
      params =  { token: user.confirmation_token }
      expect(user.confirmed_at).to eq(nil)
      put :verify, params: params
      user.reload
      expect(user.confirmation_token).to be # TODO: Hmm..
      expect(user.confirmed_at).to be
      expect(user.confirmed_at - Time.now).to be < 3
    end

    it 'verifies email changes' do
      pending
      email = "foo@bar.com"
      user.update_attributes!(unconfirmed_email: "foo@bar.com")
      params =  { token: user.confirmation_token }
      put :verify, params: params
      expect(user.reload.unconfirmed_email).to be nil
      expect(user.email).to eq email
    end
end
