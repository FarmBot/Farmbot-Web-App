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
    dont_delete = [old_pgis[1], old_pgis[2]]
    new_point_ids = rando_points + dont_delete
    payload = { name: "new name",
                point_ids: new_point_ids }
    Transport.current.connection.clear!
    put :update, body: payload.to_json, format: :json, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(PointGroupItem.exists?(do_delete)).to be false
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
    raise "TODO: Make sure auto sync is called similarly to FarmEvent"
  end
end
