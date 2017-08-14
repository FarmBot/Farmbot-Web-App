require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers
  describe 'ACME endpoint' do

    it 'has a fallback' do
      process :lets_encrypt, method: :get, params: { id: "FOO" }
      expect(response.body).to include(DashboardController::NO_ENV)
    end
  end
end
