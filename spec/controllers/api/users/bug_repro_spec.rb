require 'spec_helper'
class BugRepro < ApplicationMailer
    def bug_repro_email()
      mail(to:      "foo@bar.com",
           subject: "This will create log warnings.")
    end
end

describe Api::UsersController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers
    it 'triggers a strange log message' do
      UserMailer.welcome_email(user).deliver_later
      sleep 1
    end
end
