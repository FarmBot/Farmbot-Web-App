require "spec_helper"

describe Api::FeaturedSequencesController do
  include Devise::Test::ControllerHelpers
  let(:sequence) { FakeSequence.create() }
  before(:each) { request.headers["accept"] = "application/json" }
  it "Shows JSON for a shared sequence" do
    email = sequence.device.users.first.email
    name = sequence.name
    color = sequence.color
    description = "foo,bar,baz"
    ClimateControl.modify AUTHORIZED_PUBLISHER: email do
      sp = Sequences::Publish.run!(sequence: sequence,
                                   description: description,
                                   device: sequence.device,
                                   copyright: "FarmBot, Inc. 2021")
      get :index, params: { format: :json }
      expect(response.ok?).to be(true)
      expect(json.count).to eq(1)
      first = json.first
      id = sp.sequence_version_ids.sort.last
      expect(first[:id]).to eq(id)
      expect(first[:path]).to include(id.to_s)
      expect(first[:path]).to include("/app/shared/sequence/")
      expect(first[:name]).to eq(name)
      expect(first[:color]).to eq(color)
      expect(first[:description]).to eq(description)
    end
  end
end
