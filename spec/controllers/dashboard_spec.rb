require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers

  render_views

  describe 'ACME endpoint' do
    it "has a fallback" do
      process :lets_encrypt, method: :get, params: { id: "FOO" }
      expect(response.body).to include(DashboardController::NO_ENV)
    end

    it "renders the terms of service" do
      get :tos_update
      expect(response.status).to eq(200)
      expect(response.body).to include("webpack/tos_update.js")
    end
  end
end
