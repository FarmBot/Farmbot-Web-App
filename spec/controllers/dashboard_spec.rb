require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers
  describe 'ACME endpoint' do

    it "has a fallback" do
      process :lets_encrypt, method: :get, params: { id: "FOO" }
      expect(response.body).to include(DashboardController::NO_ENV)
    end

    it "renders the terms of service" do
      process :tos_update, method: :get
      binding.pry
      expect(response.status).to eq(200)
    end
  end
end
