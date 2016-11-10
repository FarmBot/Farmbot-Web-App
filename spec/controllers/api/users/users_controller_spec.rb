require 'spec_helper'

describe Api::UsersController do
  let(:user) { FactoryGirl.create(:user) }
  include Devise::Test::ControllerHelpers
    it 'errors if you try to delete with the wrong password' do
      sign_in user
      delete :destroy, { password: "NOPE!", format: :json } 
      expect(response.status).to eq(422)
      expect(json[:password]).to eq(Users::Destroy::BAD_PASSWORD)
    end

    it 'deletes a user account' do
      sign_in user
      delete :destroy, { password: user.password, format: :json } 
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
      patch :update, input
      expect(response.status).to eq(200)
      expect(json[:name]).to eq("Ricky McRickerson")
      expect(json[:email]).to eq("rick@rick.com")
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
      patch :update, input
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
      patch :update, input
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
      patch :update, input
      expect(response.status).to eq(422)
      expect(json[:password]).to eq(Users::Update::PASSWORD_PROBLEMS)
    end

    it 'creates a new user' do
      email = Faker::Internet.email
      original_count = User.count
      params =  { password_confirmation: "Password123",
                  password:              "Password123",
                  email:                 email,
                  name:                  "Frank" }
      post :create, params

      expect(User.count).to eq(original_count + 1)
      user = User.find json[:user][:id]
      expect(user.name).to eq("Frank")
      expect(user.email).to eq(email)
      expect(user.valid_password?('Password123')).to be_truthy
      expect(json[:token][:unencoded][:sub]).to eq(user.email)
    end

    it 'handles password confirmation mismatch' do
      email = Faker::Internet.email
      original_count = User.count
      params =  { password_confirmation: "Password123",
                  password:              "Password321",
                  email:                 email,
                  name:                  "Frank" }
      post :create, params
      expect(User.count > original_count).to be_falsy
      expect(json[:password]).to include("do not match")
      expect(response.status).to eq(422)
    end
end
