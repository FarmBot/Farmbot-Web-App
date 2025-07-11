require "spec_helper"

describe DashboardController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user, confirmed_at: nil) }

  describe "dashboard endpoint" do
    it "renders the terms of service" do
      get :tos_update
      expect(response.status).to eq(200)
    end

    it "renders the os download page" do
      get :os_download
      expect(response.status).to eq(200)
    end

    it "renders the front page" do
      get :front_page
      expect(response.status).to eq(200)
    end

    it "returns error on invalid path" do
      expect { get :main_app, params: { path: "nope.jpg" } }.to raise_error(ActionController::RoutingError)
    end

    it "receives CSP violation reports: success" do
      json_payload = { "csp-report" => { "blocked-uri" => "http://malicious.com" } }
      expect(Rollbar).to receive(:info).with("CSP Violation Report", json_payload)
      post :csp_reports, body: json_payload.to_json, params: { format: :json }
      expect(response).to have_http_status(:no_content)
    end

    it "receives CSP violation reports: JSON parse error" do
      malformed_json = "{ this is not valid json"
      expect(Rollbar).to receive(:info).with(
        "CSP Violation Report",
        hash_including(
          error: "CSP report parse error",
          exception: kind_of(String),
          raw: malformed_json
        )
      )
      post :csp_reports, body: malformed_json
      expect(response).to have_http_status(:no_content)
    end

    it "receives CSP violation reports: empty body" do
      expect(Rollbar).to receive(:info).with(
        "CSP Violation Report",
        hash_including(
          error: "CSP report parse error",
          exception: kind_of(String),
          raw: ""
        )
      )
      post :csp_reports, body: ""
      expect(response).to have_http_status(:no_content)
    end

    it "creates a new user" do
      params = { token: user.confirmation_token }
      expect(user.confirmed_at).to eq(nil)
      get :confirmation_page, params: params
      user.reload
      expect(user.confirmation_token).to be
      expect(user.confirmed_at).to be
      expect(user.confirmed_at - Time.now).to be < 3
    end

    it "verifies email changes" do
      email = "foo@bar.com"
      user.update!(unconfirmed_email: "foo@bar.com")
      params = { token: user.confirmation_token }
      get :confirmation_page, params: params
      expect(user.reload.unconfirmed_email).to be nil
      expect(user.email).to eq email
    end

    it "handles self hosted image uploads" do
      params = { key: "fake_key", file: "fake_file" }
      be_mocked = receive(:self_hosted_image_upload)
                    .with(params)
                    .and_return({something: 'testing'})
      expect(Image).to(be_mocked)
      post :direct_upload, params: params
      expect(response.status).to eq(200)
    end
  end
end
