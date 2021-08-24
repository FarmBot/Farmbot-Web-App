require "spec_helper"

describe Api::SequenceVersionsController do
  include Devise::Test::ControllerHelpers

  before :each do
    request.headers["accept"] = "application/json"
  end

  describe "#show" do
    let(:author) { FactoryBot.create(:user) }
    let(:author_device) { author.device }
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) do
      FakeSequence.create(device: author_device,
                          body: [
                            {
                              kind: "send_message",
                              args: {
                                message: "Hello, world!",
                                message_type: "warn",
                              },
                              body: [],
                            },
                          ])
    end

    before :each do
      request.headers["accept"] = "application/json"
      sign_in user
    end

    it "Shows JSON for a shared sequence" do
      sp = Sequences::Publish.run!(sequence: sequence,
                                   device: author_device)
      sv = sp.sequence_versions.last
      get :show, params: { format: :json, id: sv.id }
      expect(response.ok?).to be(true)
      expect(json[:id]).to eq(sv.id)
      expect(json[:body].first[:kind]).to eq("send_message")
    end
  end
end
