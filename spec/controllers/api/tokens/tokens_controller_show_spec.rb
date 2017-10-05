require 'spec_helper'

describe Api::TokensController do

  include Devise::Test::ControllerHelpers

  describe '#show' do
    let(:user) { FactoryGirl.create(:user, password: "password") }
    let(:auth_token) { SessionToken.issue_to(user) }

    before(:each) do
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      sleep 1 # So IAT is different.
      get :show
    end

    it 'creates a new token' do
      expect(response.status).to eq(200)
      new_claims = json[:token][:unencoded]
      old_claims = auth_token.unencoded
      # Not new EXP
      expect(new_claims[:exp]).to eq(old_claims[:exp])
      expect(new_claims[:exp]).not_to be > old_claims[:exp]
      # Not new AUD
      expect(new_claims[:aud]).to eq(old_claims[:aud])
      # New IAT
      expect(new_claims[:iat]).not_to eq(old_claims[:iat])
    end
  end
end
