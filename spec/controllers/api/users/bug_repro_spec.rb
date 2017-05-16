require 'spec_helper'

describe Api::UsersController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers
    it 'triggers a strange log message' do
      UserMailer.welcome_email(user).deliver_later
      sleep 1
    end
end
