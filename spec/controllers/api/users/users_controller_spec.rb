require 'spec_helper'

BIG_WARNING = <<~HEREDOC
  MAYBE A WARNING:
  YOU HAVE CHOSEN TO SKIP TESTS FOR USER VERIFICATION.
  If you are a self hosted user that does not want email functionality,
  you can ignore this message.
  If you *do* want to use email in your farmbot setup, consider this a
  failure.
HEREDOC

describe Api::UsersController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers
    it 'shows a user record' do
      sign_in user
      get :show, format: :json
      expect(response.status).to eq(200)
      expect(json).to be_kind_of(Array)
      time_stamps = [:created_at, :updated_at]
      expect(json.first.except(*time_stamps))
        .to eq(UserSerializer.new(user).as_json.except(*time_stamps))
    end

    it 'errors if you try to delete with the wrong password' do
      sign_in user
      delete :destroy, params: { password: "NOPE!" }, format: :json
      expect(response.status).to eq(422)
      expect(json[:password]).to eq(Users::Destroy::BAD_PASSWORD)
    end

    it 'deletes a user account' do
      sign_in user
      delete :destroy, params: { password: user.password }, format: :json
      expect(response.status).to eq(200)
      expect(User.where(id: user.id).count).to eq(0)
    end

    it 'updates user info' do
      sign_in user
      old_pass = user.password
      input = {
        email: "rick@rick.com",
        name: "Ricky McRickerson",
        format: :json
      }
      patch :update, params: input
      expect(response.status).to eq(200)
      expect(json[:name]).to eq("Ricky McRickerson")
      # Updates to user email require confirmation.
      expect(json[:email]).not_to eq(input[:email])
      expect(json[:email]).to eq(user.email)
    end

    it 'updates password' do
      sign_in user
      old_pass = user.password
      input = {
        password: old_pass,
        new_password: "123456789",
        new_password_confirmation: "123456789",
        format: :json
      }
      patch :update, params: input
      expect(response.status).to eq(200)
      user.reload
      expect(user.valid_password?(old_pass)).to be_falsy
      expect(user.valid_password?("123456789")).to be_truthy
    end

    it 'errors if password confirmation does not match' do
      sign_in user
      old_pass = user.password
      input = {
        old_password: old_pass,
        password: "123456789"  + "WRONG!",
        password_confirmation: "123456789",
        format: :json
      }
      patch :update, params: input
      expect(response.status).to eq(422)
      expect(json[:password]).to eq(Users::Update::PASSWORD_PROBLEMS)
    end

    it 'errors if password and old password does not match' do
      sign_in user
      old_pass = user.password
      input = {
        old_password: old_pass + "WRONG!",
        password: "123456789",
        password_confirmation: "123456789",
        format: :json
      }
      patch :update, params: input
      expect(response.status).to eq(422)
      expect(json[:password]).to eq(Users::Update::PASSWORD_PROBLEMS)
    end

    it 'creates a new user' do
      empty_mail_bag
      email = Faker::Internet.email
      original_count = User.count
      params =  { password_confirmation: "Password123",
                  password:              "Password123",
                  email:                 email,
                  name:                  "Frank" }
      old_email_count = ActionMailer::Base.deliveries.length
      run_jobs_now do
        post :create, params: params
        user = User.last
        if User::SKIP_EMAIL_VALIDATION
          puts BIG_WARNING
        else
          expect(ActionMailer::Base.deliveries.length).to be > old_email_count
          msg = ActionMailer::Base.deliveries.last
          expect(msg.to.first).to eq(email)
          expect(msg.body.parts.first.to_s).to include(user.confirmation_token)
          expect(User.count).to eq(original_count + 1)
          expect(user.name).to eq("Frank")
          expect(user.email).to eq(email)
          expect(user.valid_password?('Password123')).to be_truthy
        end
      end
    end

    it 'can not re-verify' do
      user.update_attributes(confirmed_at: Time.now)
      sign_in user
      put :verify, params: { token: user.confirmation_token }, format: :json
      expect(response.status).to eq(409)
      expect(subject.default_serializer_options[:root]).to be false
      expect(subject.default_serializer_options[:user]).to eq(user)
    end

    it 'handles password confirmation mismatch' do
      email = Faker::Internet.email
      original_count = User.count
      params =  { password_confirmation: "Password123",
                  password:              "Password321",
                  email:                 email,
                  name:                  "Frank" }
      post :create, params: params
      expect(User.count > original_count).to be_falsy
      expect(json[:password]).to include("do not match")
      expect(response.status).to eq(422)
    end

    it 'refuses to send token to a user if they are already verified' do
      verified = User.create!(email:                 Faker::Internet.email,
                              password:              "password123",
                              password_confirmation: "password123",
                              confirmed_at:           Time.now)

      post :resend_verification,
           params: { email: verified.email },
           format: :json

      expect(response.status).to eq(422)
      expect(json[:user])
        .to include(Users::ResendVerification::ALREADY_VERIFIED)
    end
    unless ENV["NO_EMAILS"]
      it 're-sends verification email' do
        unverified = User.create!(email:                 Faker::Internet.email,
                                  password:              "password123",
                                  password_confirmation: "password123")

        post :resend_verification,
            params: { email: unverified.email },
            format: :json

        expect(response.status).to eq(200)
        expect(json[:user]).to include(Users::ResendVerification::SENT)
      end
    else
      puts "Skipping test because NO_EMAILS was enabled."
    end
end
