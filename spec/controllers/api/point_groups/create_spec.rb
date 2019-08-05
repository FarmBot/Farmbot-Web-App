require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:point_ids) do
    [
      :tool_slot,
      :generic_pointer,
      :plant,
    ].map { |x| FactoryBot.create(x, device: device).id }.sort
  end

  it "creates a point group" do
    sign_in user
    payload = { name: "this is a group", point_ids: point_ids }
    before = PointGroup.count
    post :create, body: payload.to_json, format: :json
    expect(response.status).to eq(200)
    expect(before).to be < PointGroup.count

    expect(json[:name]).to eq(payload[:name])
    expect(json[:point_ids].count).to eq(3)
    point_ids.map do |this_id|
      expect(json[:point_ids]).to include(this_id)
    end
  end
end
