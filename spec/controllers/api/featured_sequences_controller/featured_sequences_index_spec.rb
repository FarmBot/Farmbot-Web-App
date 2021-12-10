require "spec_helper"

describe Api::FeaturedSequencesController do
  include Devise::Test::ControllerHelpers
  let(:sequence) { FakeSequence.create() }
  before(:each) { request.headers["accept"] = "application/json" }
  it "Shows JSON for a shared sequence" do
    email = sequence.device.users.first.email
    name = sequence.name
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
      expect(first[:url]).to include(id.to_s)
      expect(first[:url]).to include($API_URL)
      expect(first[:name]).to eq(name)
      expect(first[:description]).to eq(description)
    end
  end
end
