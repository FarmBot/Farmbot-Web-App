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
      # first entry in api_docs.md
      SmarfDoc.note("Documentation generated for the " +
        "[FarmBot Web App](https://github.com/FarmBot/Farmbot-Web-App).")
    end

    it "returns error on invalid path" do
      expect { get :main_app, params: { path: "nope.jpg" } }
        .to raise_error(ActionController::RoutingError)
    end

    it "receives CSP violation reports (malformed JSON)" do
      # expect(Rollbar).to receive(:info)
      # .with("CSP Violation", { problem: "Crashed while parsing report" })
      post :csp_reports, body: "NOT JSON ! ! !"
      expect(json).to eq(problem: "Crashed while parsing report")
    end

    it "receives CSP violation reports (JSON)" do
      post :csp_reports, body: {}.to_json, params: { format: :json }
      expect(json).to eq({})
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
      name = "wow.jpg"
      params = { key: "whatever/" + name,
                file: StringIO.new(File.open("./spec/fixture.jpg").read) }
      post :direct_upload, params: params
      file = File.join("public", "direct_upload", "temp", name)
      expect(File.file?(file)).to be(true)
      expect(response.status).to eq(200)
      File.delete(file)
    end
  end
end
