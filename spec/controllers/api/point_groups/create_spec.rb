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
    expect(json[:sort_type]).to eq("xy_ascending")
  end

  it "alerts the user about bad point_ids" do
    sign_in user
    point_ids = [0]
    payload = { name: "this is a group", point_ids: point_ids }
    before = PointGroup.count
    post :create, body: payload.to_json, format: :json
    expect(response.status).to eq(422)
    expect(before).to eq(PointGroup.count)
    expect(json.fetch(:points)).to include(PointGroups::Create::BAD_POINT_IDS)
  end

  it "disallows malformed sort_types" do
    sign_in user
    payload = { name: "_", point_ids: [], sort_type: "q" }
    before = PointGroup.count
    post :create, body: payload.to_json, format: :json
    expect(response.status).to eq(422)
    expect(json[:sort_type]).to include(PointGroup::BAD_SORT.split("}").last)
  end

  it "adds criteria to a group" do
    sign_in user
    payload = {
      name: "Criteria group",
      point_ids: point_ids,
      criteria: {
        string_eq: {
          openfarm_slug: ["carrot"],
        },
        number_eq: {
          z: [24, 25, 26],
        },
        number_lt: {
          x: 4,
          y: 4,
        },
        number_gt: {
          x: 1,
          y: 1,
        },
        day: {
          op: "<",
          days_ago: 0,
        },
      },
    }

    post :create, body: payload.to_json, format: :json
    expect(response.status).to eq(200)
    hash = json[:criteria]
    expect(hash).to be_kind_of(Hash)
    expect(hash.dig(:number_eq, :z)).to eq([24, 25, 26])
    expect(hash.dig(:number_lt, :x)).to eq(4)
    expect(hash.dig(:number_lt, :y)).to eq(4)
    expect(hash.dig(:number_gt, :x)).to eq(1)
    expect(hash.dig(:number_gt, :y)).to eq(1)
    expect(hash.dig(:day, :op)).to eq("<")
    expect(hash.dig(:day, :days_ago)).to eq(0)
    expect(hash.dig(:string_eq, :openfarm_slug)).to eq(["carrot"])
  end
end
