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

  let(:pg) do
    PointGroups::Create.run!(device: device,
                             point_ids: old_point_ids,
                             name: "PointGroups::Update test")
  end

  it "updates point groups" do
    sign_in user
    do_delete = old_point_ids[0]
    dont_delete = [old_point_ids[1], old_point_ids[2]]
    new_point_ids = rando_points + dont_delete
    payload = { name: "new name",
                point_ids: new_point_ids }
    put :update, body: payload.to_json, format: :json, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(PointGroupItem.exists?(do_delete)).to be false
    dont_delete.map { |id| expect(PointGroupItem.exists?(id)).to be(true) }
    expect(json[:point_ids].count).to eq(new_point_ids.count)
    expect(json.fetch(:name)).to eq "new name"
    expect(new_point_ids.to_set).to eq(json.fetch(:point_ids).to_set)
  end
end
