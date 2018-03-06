require 'spec_helper'

describe DashboardController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user, confirmed_at: nil) }

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

    it 'creates a new user' do
      params =  { token: user.confirmation_token }
      expect(user.confirmed_at).to eq(nil)
      get :verify, params: params
      user.reload
      expect(user.confirmation_token).to be # TODO: Hmm..
      expect(user.confirmed_at).to be
      expect(user.confirmed_at - Time.now).to be < 3
    end

    it 'verifies email changes' do
      email = "foo@bar.com"
      user.update_attributes!(unconfirmed_email: "foo@bar.com")
      params =  { token: user.confirmation_token }
      get :verify, params: params
      expect(user.reload.unconfirmed_email).to be nil
      expect(user.email).to eq email
    end
  end
end
