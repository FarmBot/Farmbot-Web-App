require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers

  def rando_points
    [
      :tool_slot,
      :generic_pointer,
      :plant,
    ].map { |x| FactoryBot.create(x, device: device).id }.sort
  end

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:old_point_ids) do rando_points end

  it "updates point groups" do
    PointGroup.destroy_all
    PointGroupItem.destroy_all
    sign_in user
    pg = PointGroups::Create.run!(device: device,
                                  point_ids: old_point_ids,
                                  name: "PointGroups::Update test")

    old_pgis = PointGroupItem.where(point_id: old_point_ids).pluck(:point_id)
    do_delete = old_pgis[0]
    do_delete_pgi = PointGroupItem.find_by(point_id: do_delete)
    dont_delete = [old_pgis[1], old_pgis[2]]
    new_point_ids = rando_points + dont_delete
    payload = { name: "new name",
                point_ids: new_point_ids }
    Transport.current.connection.clear!
    put :update, body: payload.to_json, format: :json, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(PointGroupItem.exists?(do_delete_pgi.id)).to be false
    expect(PointGroupItem.where(point_id: new_point_ids).count).to eq(new_point_ids.count)
    expect(json[:point_ids].count).to eq(new_point_ids.count)
    expect(json.fetch(:name)).to eq "new name"
    expect(new_point_ids.to_set).to eq(json.fetch(:point_ids).to_set)
    calls = Transport.current.connection.calls.fetch(:publish)
    expect(calls.length).to eq(1) # Don't echo!
    call1 = calls.first
    expect(call1.last.fetch(:routing_key)).to include(".sync.PointGroup.")
    json2 = JSON.parse(call1.first, symbolize_names: true).fetch(:body)
    expect(json).to eq(json2)
  end

  it "updates criteria of a group" do
    sign_in user
    initial_params = {
      device: device,
      name: "XYZ",
      point_ids: [],
      criteria: {
        string_eq: { openfarm_slug: ["carrot"] },
        number_eq: { z: [24, 25, 26] },
        number_lt: { x: 4, y: 4 },
        number_gt: { x: 1, y: 1 },
        day: { op: "<", days: 0 },
      },
    }
    pg = PointGroups::Create.run!(initial_params)
    payload = {
      point_ids: [],
      criteria: {
        string_eq: { name: ["carrot"] },
        number_eq: { x: [42, 52, 62] },
        number_lt: { y: 8 },
        number_gt: { z: 2 },
        day: { op: ">", days: 10 },
      },
    }
    put :update, body: payload.to_json, format: :json, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(json.dig(:criteria, :day, :days)).to eq(10)
    expect(json.dig(:criteria, :day, :op)).to eq(">")
    expect(json.dig(:criteria, :number_eq, :x)).to eq([42, 52, 62])
    expect(json.dig(:criteria, :number_eq, :z)).to eq(nil)
    expect(json.dig(:criteria, :number_gt, :x)).to eq(nil)
    expect(json.dig(:criteria, :number_gt, :y)).to eq(nil)
    expect(json.dig(:criteria, :number_gt, :z)).to eq(2)
    expect(json.dig(:criteria, :number_lt, :x)).to eq(nil)
    expect(json.dig(:criteria, :number_lt, :y)).to eq(8)
    expect(json.dig(:criteria, :string_eq, :name)).to eq(["carrot"])
    expect(json.dig(:criteria, :string_eq, :openfarm_slug)).to eq(nil)
  end
end
