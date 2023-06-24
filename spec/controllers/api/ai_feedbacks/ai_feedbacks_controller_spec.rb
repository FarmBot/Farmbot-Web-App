require "spec_helper"

describe Api::AiFeedbacksController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "creates ai feedback" do
    sign_in user
    input = { prompt: "write code", reaction: "good" }
    b4 = AiFeedback.count
    post :create, body: input.to_json, params: { format: :json }
    expect(response.status).to eq(200)
    expect(AiFeedback.count).to be > b4
    expect(json[:reaction]).to eq("good")
  end
end
