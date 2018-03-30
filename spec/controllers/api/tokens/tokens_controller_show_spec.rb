require 'spec_helper'

describe Api::TokensController do

  include Devise::Test::ControllerHelpers

  describe '#show' do
    let(:user) { FactoryBot.create(:user, password: "password") }
    let(:auth_token) do
      SessionToken.issue_to(user, fbos_version: Gem::Version.new("9.9.9"))
    end

    it 'creates a new token' do
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      sleep 1 # To create unique IAT values.
      get :show
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
      # If this crashes, the base64 encoding is broke.
      expect(JSON.parse(Base64.decode64(json[:token][:encoded].split(".")[1])))
        .to be_kind_of(Hash)
    end

    it 'denies bad tokens' do
      request.headers["Authorization"] = "bearer #{auth_token.encoded + "no..."}"
      get :show
      expect(json.dig(:error, :jwt)).to eq(Auth::ReloadToken::BAD_SUB)
    end


    it 'allows good tokens' do
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      get :show
      expect(response.status).to be(200)
    end

    it 'denies expired (revoked) tokens' do
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      TokenIssuance.destroy_all
      get :show
      expect(response.status).to eq(401)
      expect(json.dig(:error, :jwt)).to include("log out and try again")
    end

    it 'handles bad `sub` claims' do
      # Simulate a legacy API token.
      token = AbstractJwtToken.new([{
        aud:              AbstractJwtToken::HUMAN_AUD,
        sub:              "this_is_wrong@example.com",
        iat:              Time.now.to_i,
        jti:              SecureRandom.uuid,
        iss:              "whatever",
        exp:              (Time.now + 40.days).to_i,
        mqtt:             "",
        mqtt_ws:          "",
        os_update_server: "",
        bot:              "device_#{user.device.id}" }])
      request.headers["Authorization"] = "bearer #{token.encoded}"
      get :show
      expect(response.status).to be(401)
      expect(json[:error].values).to include(Auth::ReloadToken::BAD_SUB)
    end
  end
end
