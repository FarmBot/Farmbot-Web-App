require "spec_helper"

describe Api::FeedbacksController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "submits feedback" do
    sign_in user
    input = { message: "Example message", slug: "Example slug" }
    expect(Faraday).to receive(:post).and_return("THIS IS A STUB")
    with_modified_env FEEDBACK_WEBHOOK_URL: 'https://localhost:3000/' do
      run_jobs_now do
        post :create, body: input.to_json
      end
    end
    expect(response.status).to eq(200)
  end
end
