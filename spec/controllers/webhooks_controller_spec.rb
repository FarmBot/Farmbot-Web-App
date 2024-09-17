require "spec_helper"

describe WebhooksController do
  include Devise::Test::ControllerHelpers
  before do
    allow(Faraday).to receive(:post)
  end

  RELEASE = {
    id: "id",
    data: {
      status: "succeeded",
      current: true,
      description: "description",
      slug: {
        commit_description: "commit_description",
      },
    },
    resource: "release",
    action: "update",
  }
  BUILD = {
    id: "id",
    data: {
      status: "pending",
      output_stream_url: "output_stream_url",
    },
    resource: "build",
    action: "create",
  }

  it "handles a release payload" do
    with_modified_env(
      RELEASE_WEBHOOK_URL: "https://example.com/webhook_url",
      HEROKU_WEBHOOK_SECRET: "secret",
    ) do
      stub_request(:post, ENV["RELEASE_WEBHOOK_URL"]).
        to_return(status: 200, body: "", headers: {})
      request.headers["Heroku-Webhook-Hmac-SHA256"] = Base64.strict_encode64(
        OpenSSL::HMAC.digest("sha256", "secret", RELEASE.to_json))
      request.headers["Content-Type"] = "application/json"
      post :create, body: RELEASE.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:message]).to eq("Webhook received successfully")
      expect(Faraday).to have_received(:post).with(
        ENV["RELEASE_WEBHOOK_URL"],
        {"mrkdwn":true,
        "text":"New production Heroku event: description `succeeded`",
        "blocks":[{
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text":"New production Heroku event: description `succeeded`\ncommit_description"}}],
        "channel":"#software"}.to_json,
        "Content-Type" => "application/json")
    end
  end

  it "handles a build payload" do
    with_modified_env(
      RELEASE_WEBHOOK_URL: "https://example.com/webhook_url",
      HEROKU_WEBHOOK_SECRET: "secret",
    ) do
      stub_request(:post, ENV["RELEASE_WEBHOOK_URL"]).
        to_return(status: 200, body: "", headers: {})
      request.headers["Heroku-Webhook-Hmac-SHA256"] = Base64.strict_encode64(
        OpenSSL::HMAC.digest("sha256", "secret", BUILD.to_json))
      request.headers["Content-Type"] = "application/json"
      post :create, body: BUILD.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:message]).to eq("Webhook received successfully")
      expect(Faraday).to have_received(:post).with(
        ENV["RELEASE_WEBHOOK_URL"],
        {"mrkdwn":true,
        "text":"New production Heroku event: Build started",
        "blocks":[{
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text":"New production Heroku event: Build started\n\u003coutput_stream_url|build log\u003e"}}],
        "channel":"#software"}.to_json,
        "Content-Type" => "application/json")
    end
  end

  it "receives a webhook: no relay" do
    with_modified_env(HEROKU_WEBHOOK_SECRET: "secret", RELEASE_WEBHOOK_URL: nil) do
      request.headers["Heroku-Webhook-Hmac-SHA256"] = Base64.strict_encode64(
        OpenSSL::HMAC.digest("sha256", "secret", RELEASE.to_json))
      request.headers["Content-Type"] = "application/json"
      post :create, body: RELEASE.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:message]).to eq("Webhook received successfully")
    end
  end

  it "rejects a webhook with an invalid signature" do
    with_modified_env HEROKU_WEBHOOK_SECRET: "secret" do
      request.headers["Heroku-Webhook-Hmac-SHA256"] = "invalid"
      request.headers["Content-Type"] = "application/json"
      post :create, body: RELEASE.to_json, params: { format: :json }
      expect(response.status).to eq(403)
      expect(json[:message]).to eq("Invalid signature")
    end
  end

  it "rejects a webhook with a missing secret" do
    with_modified_env HEROKU_WEBHOOK_SECRET: nil do
      request.headers["Content-Type"] = "application/json"
      post :create, body: RELEASE.to_json, params: { format: :json }
      expect(response.status).to eq(403)
      expect(json[:message]).to eq("Secret not set")
    end
  end
end
