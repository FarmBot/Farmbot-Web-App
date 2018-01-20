require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers

  describe 'dashboard endpoint' do
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

    it "receives CSP violation reports (malformed JSON)" do
      expect(Rollbar).to receive(:error)
        .with("CSP VIOLATION!!!", {problem: "Crashed while parsing report"})
      post :csp_reports, body: "NOT JSON ! ! !"
    end

    it "receives CSP violation reports (malformed JSON)" do
      expect(Rollbar).to receive(:error)
        .with("CSP VIOLATION!!!", {})
      post :csp_reports, body: {}.to_json, params: {format: :json}
    end
  end
end
