require "spec_helper"

describe Api::WebcamFeedsController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "updates a webcam feed URL" do
    # Create a webcam feed first....
    sign_in user

    feed = WebcamFeed.create! name: "wow",
                              device: user.device,
                              url: "bar.jpg"
    input = { url: "/foo.jpg", name: "ok" }
    patch :update, body: input.to_json, params: { format: :json, id: feed.id }
    expect(response.status).to eq(200)
    expect(json[:url]).to eq("/foo.jpg")
    expect(json[:name]).to eq("ok")
  end
end
