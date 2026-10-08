require "spec_helper"
describe PointGroup do
  let(:device) { FactoryBot.create(:user).device }
  let(:point) do
    Points::Create.run!(x: 0,
                        y: 0,
                        z: 0,
                        device: device,
                        pointer_type: "GenericPointer")
  end
  let!(:point_group) do
    PointGroups::Create.run!(device: device,
                             name: "test",
                             point_ids: [point.id])
  end

  let(:s1) do
    Sequences::Create.run!(kind: "sequence",
                           device: device,
                           name: "has parameters",
                           args: {
                             locals: {
                               kind: "scope_declaration",
                               args: {},
                               body: [
                                 {
                                   kind: "parameter_declaration",
                                   args: {
                                     label: "parent",
                                     default_value: {
                                       kind: "coordinate",
                                       args: { x: 9, y: 9, z: 9 },
                                     },
                                   },
                                 },
                               ],
                             },
                           },
                           body: [
                             {
                               kind: "move_absolute",
                               args: {
                                 speed: 100,
                                 location: {
                                   kind: "identifier",
                                   args: { label: "parent" },
                                 },
                                 offset: {
                                   kind: "coordinate",
                                   args: { x: 0, y: 0, z: 0 },
                                 },
                               },
                             },
                           ])
  end

  [:deep_symbolize_keys, :deep_stringify_keys].each do |key_conversion|
    it "merges #{key_conversion} criteria without duplicate JSON keys" do
      criteria = {
        day: { op: ">", days_ago: 10 },
        string_eq: { pointer_type: ["Plant"] },
        number_eq: {},
        number_lt: {},
        number_gt: {},
      }
      group = PointGroups::Create.run!(device: device,
                                       name: "All plants",
                                       point_ids: [],
                                       criteria: criteria.public_send(key_conversion))
      expected = PointGroup::DEFAULT_CRITERIA.merge(criteria)

      expect(group.reload.criteria).to eq(expected)
      payload = JSON.parse(group.broadcast_payload("test-label"))
      expect(payload.fetch("body").fetch("criteria"))
        .to eq(expected.deep_stringify_keys)
    end
  end

  it "broadcasts legacy criteria without duplicate JSON keys" do
    criteria = {
      day: { op: ">", days_ago: 10 },
      string_eq: { pointer_type: ["GenericPointer"] },
      number_eq: {},
      number_lt: {},
      number_gt: {},
    }
    legacy_criteria = PointGroup::DEFAULT_CRITERIA.merge(criteria.deep_stringify_keys)
    point_group.update_column(:criteria, legacy_criteria)

    payload = JSON.parse(point_group.reload.broadcast_payload("test-label"))

    expect(payload.fetch("body").fetch("criteria")).to eq(criteria.deep_stringify_keys)
    expect(point_group.criteria).to eq(legacy_criteria)
  end

  it "maintains referential integrity" do
    PointGroupItem.destroy_all
    Point.destroy_all
    expect(PointGroupItem.count).to eq(0)
    Points::Destroy.run!(point: point,
                         device: device,
                         hard_delete: true)
    expect(PointGroupItem.count).to eq(0)
  end

  it "refuses to delete groups in-use by sequences" do
    # Create a group and use it in a sequence
    Sequences::Create.run!(name: "Wrapper",
                           device: device,
                           body: [
                             {
                               kind: "execute",
                               args: {
                                 sequence_id: s1.fetch(:id),
                               },
                               body: [
                                 {
                                   kind: "parameter_application",
                                   args: {
                                     label: "parent",
                                     data_value: {
                                       kind: "point_group",
                                       args: {
                                         point_group_id: point_group.id,
                                       },
                                     },
                                   },
                                   body: [],
                                 },
                               ],

                             },
                           ])
    result = PointGroups::Destroy.run(point_group: point_group, device: device)
    error = result.errors.fetch("in_use").message
    expect(error).to eq("Can't delete group because it is in use by sequence 'Wrapper'")
  end

  it "refuses to delete groups in-use by regimens" do
    point_group.update!(name: "@@@")
    Regimens::Create.run!(name: "Wrapper 26",
                          device: device,
                          color: "red",
                          regimen_items: [],
                          body: [
                            {
                              kind: "parameter_application",
                              args: {
                                label: "parent",
                                data_value: {
                                  kind: "point_group",
                                  args: {
                                    point_group_id: point_group.id,
                                  },
                                },
                              },
                            },
                          ])
    result = PointGroups::Destroy.run(point_group: point_group, device: device)
    error = result.errors.fetch("in_use").message
    expect(error).to eq("Can't delete group because it is in use by Regimen 'Wrapper 26'")
  end
end
