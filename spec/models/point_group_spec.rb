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
    # Create a group (done)
    # Use it in a sequence
    s1 = Sequences::Create.run!(kind: "sequence",
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
    boom = ->() do
      PointGroups::Destroy.run!(point_group: point_group, device: device)
    end

    expect(boom).to raise_error(Mutations::ValidationException)
    # expect it to fail
  end

  it "refuses to delete groups in-use by regimens"
  it "refuses to delete groups in-use by farm events"
end
