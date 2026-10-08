require "spec_helper"

describe Api::PointGroupsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  [{}, { page: 1, per: 10 }].each do |pagination|
    it "lists legacy criteria without duplicate JSON keys with params #{pagination}" do
      sign_in user
      group = PointGroups::Create.run!(device: device,
                                       name: "Legacy group",
                                       point_ids: [])
      criteria = {
        day: { op: ">", days_ago: 10 },
        string_eq: { pointer_type: ["GenericPointer"] },
        number_eq: {},
        number_lt: {},
        number_gt: {},
      }
      legacy_criteria = PointGroup::DEFAULT_CRITERIA.merge(criteria.deep_stringify_keys)
      group.update_column(:criteria, legacy_criteria)

      get :index, params: pagination

      expect(response.status).to eq(200)
      expect(json.fetch(0).fetch(:criteria)).to eq(criteria)
      expect(group.reload.criteria).to eq(legacy_criteria)
    end
  end

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
