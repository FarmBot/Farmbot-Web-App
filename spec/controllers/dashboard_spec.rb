require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers

  # render_views Delaying this part until webpack-rails workflow is found -RC

  describe 'ACME endpoint' do
    it "has a fallback" do
      process :lets_encrypt, method: :get, params: { id: "FOO" }
      expect(response.body).to include(DashboardController::NO_ENV)
    end

    it "renders the terms of service" do
      get :tos_update
      expect(response.status).to eq(200)
    end

    it "renders the terms of service" do
      get :front_page
      expect(response.status).to eq(200)
    end

    it "renders the terms of service" do
      expect { get :main_app, params: {path: "nope.jpg"} }
        .to raise_error(ActionController::RoutingError)
    end
  end
end
