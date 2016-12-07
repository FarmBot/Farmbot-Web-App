require 'spec_helper'

describe Api::UsersController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers

    it 'creates a new user' do
      params =  { token: user.verification_token }
      put :verify, params: params
      binding.pry
    end
end
