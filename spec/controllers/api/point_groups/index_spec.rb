require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "lists all point groups" do
    sign_in user
    4.times do |n|
      point_ids = [:tool_slot, :generic_pointer, :plant].sample(rand(0..3))
        .map { |x| FactoryBot.create(x, device: device).id }
      PointGroups::Create.run!(device: device,
                               name: "PG test #{n}",
                               point_ids: point_ids)
    end
    get :index
    expect(json.length).to eq(4)
  end
end
