require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "destroy a point group" do
    sign_in user
    pg =
      PointGroups::Create.run!(device: device, name: "PG test", point_ids: [])
    delete :destroy, params: { id: pg.id }
    expect(response.body).to eq("")
    expect(response.status).to eq(200)
    expect(PointGroup.where(id: pg.id).count).to eq(0)
  end
end
