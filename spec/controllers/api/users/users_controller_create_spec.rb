require 'spec_helper'

describe Api::UsersController do

  include Devise::TestHelpers

  describe '#create' do

    it 'creates a new user' do
      original_count = User.count
      params =  { password_confirmation: "Password123",
                  password:              "Password123",
                  email:                 "t@g.com",
                  name:                  "Frank" }
      post :create, params
      expect(User.count > original_count).to be_truthy
      user = User.find json[:_id]
      expect(user.name).to eq("Frank")
      expect(user.email).to eq("t@g.com")
      expect(user.valid_password?('Password123')).to be_truthy
    end

    it 'handles password confirmation mismatch' do
      params =  { password_confirmation: "Password123",
                  password:              "Password321",
                  email:                 "t@g.com",
                  name:                  "Frank" }
      post :create, params
      expect(User.count > original_count).to be_falsy
      expect(json[:password]).to include("do not match")
      expect(response.status).to eq(422)
    end
  end
end
