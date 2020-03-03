require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:old_point_ids) do rando_points end

  it "shows a single point group" do
    PointGroup.destroy_all
    PointGroupItem.destroy_all
    sign_in device.users.first
    pg = PointGroups::Create
      .run!(device: device, point_ids: [], name: "PointGroups#show test")
    get :show, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(json.fetch(:name)).to eq pg.name
  end

  it "fills `nil` criteria with PointGroup::DEFAULT_CRITERIA" do
    pg = PointGroup.create!(name: "x", device: device, criteria: nil )
    sign_in user
    get :show, params: { id: pg.id }
    expect(response.status).to eq(200)
    expect(json.fetch(:criteria)).to eq PointGroup::DEFAULT_CRITERIA
  end
end
