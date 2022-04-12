require "spec_helper"

describe Api::SequenceVersionsController do
  include Devise::Test::ControllerHelpers

  before :each do
    request.headers["accept"] = "application/json"
  end

  describe "#show" do
    comment = "This is a comment"
    let(:author) { FactoryBot.create(:user) }
    let(:author_device) { author.device }
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) do
      FakeSequence.create(device: author_device,
                          body: [
                            {
                              comment: comment,
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
      description = "An SV with comments"
      sp = Sequences::Publish.run!(sequence: sequence,
                                   description: description,
                                   device: author_device,
                                   copyright: "FarmBot, Inc. 2021")
      sv = sp.sequence_versions.last
      expect(sv.fragment_owner?).to be(true)
      get :show, params: { format: :json, id: sv.id }
      expect(response.ok?).to be(true)
      expect(json[:id]).to eq(sv.id)
      expect(json[:body].first[:kind]).to eq("send_message")
      expect(json[:description]).to eq(description)
      expect(json[:name]).to eq(sequence.name)
      expect(json[:color]).to eq(sequence.color)
      expect(json.dig(:body, 0, :comment)).to eq(comment)
    end
  end
end
