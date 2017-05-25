require 'spec_helper'
describe Api::PasswordResetsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }

    it 'resets password for a user' do
      params = { email: user.email }

      old_email_count = ActionMailer::Base.deliveries.length
      post :create, params: params
      expect(response.status).to eq(200)
      # expect(UserMailer).to(receive(:deliver_signup).with("email@example.com", "Jimmy Bean"))
      sleep 0.75 # Mail deliveries occur in background thread. TODO: Fix this
                # `sleep` nonsense the right way.
      expect(ActionMailer::Base.deliveries.length).to be > old_email_count
      message = ActionMailer::Base.deliveries.last.to_s
      expect(message).to include("password reset")
    end

    it 'resets password using a reset token' do
      params = { password:              "xpassword123",
                 password_confirmation: "xpassword123",
                 id:                    PasswordResetToken
                                          .issue_to(user)
                                          .encoded }
      put :update, params: params
      expect(user
             .reload
             .valid_password?(params[:password])).to eq(true)
      expect(response.status).to eq(200)
      expect(json.keys).to include(:token)
      expect(json.keys).to include(:user)
    end
  end
end
