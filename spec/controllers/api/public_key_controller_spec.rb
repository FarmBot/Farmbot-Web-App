require 'spec_helper'

describe Api::PublicKeysController do
  include Devise::Test::ControllerHelpers

  describe 'public key endpoint' do
    it "returns a public key" do
      get :show
      expect(response.status).to eq(200)
      expect(response.body).to eq(Api::PublicKeysController::PUBLIC_KEY)
    end
  end
end
