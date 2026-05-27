require "spec_helper"
require_relative "scenario"

describe Points::Destroy do
  let(:device) { FactoryBot.create(:device) }

  it "cleans up point groups" do
    previous_count = PointGroupItem.count
    # Create point
    point = Points::Create.run!(device: device,
                                name: "ref integrity",
                                x: 0,
                                y: 0,
                                z: 0,
                                pointer_type: "GenericPointer")

    # add it to a group
    pg = PointGroups::Create.run!(device: device,
                                  point_ids: [point.id],
                                  name: "ref integrity")
    expect(pg.point_group_items.count).to eq(1)
    old_ts = pg.updated_at
    # Destroy the point
    Points::Destroy.run!(device: device, point: point)

    # Ensure `point_id` is gone from group
    expect(pg.reload.point_group_items.count).to eq(0)
    expect(pg.updated_at).to be > old_ts
    expect(PointGroupItem.count).to eq(previous_count)
  end

  it "prevents deletion of points that are in use" do
    # create many points
    points = FactoryBot.create_list(:generic_pointer, 3, device: device)
    # use one point in a sequence.
    params = {
      name: "Test Case I",
      device: device,
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "point",
              args: {
                pointer_type: "GenericPointer",
                pointer_id: points.first.id,
              },
            },
            offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          },
        },
      ],
    }
    sequence = Sequences::Create.run!(params)
    before = Point.count
    # Attempt to delete
    result = Points::Destroy.run(point_ids: points.pluck(:id), device: device)
    # Expect error about point in use still.
    expect(result.success?).to be false
    expect(Point.count).to eq(before)
    expect(result.errors.message_list.count).to eq(1)
    expect(result.errors.message_list.first).to include(params[:name])
    coords = [:x, :y, :z].map { |c| points.first[c] }.join(", ")
    expected = "Could not delete point at (#{coords}). Items are in use " \
               "by Sequence 'Test Case I'."
    expect(result.errors.message_list.first).to include(expected)
  end

  it "prevents deletion of active tool slots" do
    s = Points::Scenario.new
    point_ids = [s.tool_slot.id]
    result = Points::Destroy.run(point_ids: point_ids, device: s.device)
    expect(result.success?).to be(false)
    expected = "Could not delete Scenario Tool. Item is in use by " \
               "Sequence 'Scenario Sequence'."
    expect(result.errors.message_list).to include(expected)
  end

  it "prevents deletion of points used by farm event fragments" do
    point = FactoryBot.create(:generic_pointer,
                              device: device,
                              x: 4,
                              y: 5,
                              z: 6)
    farm_event = FactoryBot.create(:farm_event,
                                   device: device,
                                   start_time: Time.now + 1.day)
    Fragment.from_celery(device: device,
                         owner: farm_event,
                         kind: "internal_farm_event",
                         args: {},
                         body: [
                           {
                             kind: "parameter_application",
                             args: {
                               label: "location",
                               data_value: {
                                 kind: "point",
                                 args: {
                                   pointer_type: "GenericPointer",
                                   pointer_id: point.id,
                                 },
                               },
                             },
                           },
                         ])

    result = Points::Destroy.run(point_ids: [point.id], device: device)

    expect(result.success?).to be(false)
    expected = "Could not delete point at (4.0, 5.0, 6.0). Item is in use " \
               "by FarmEvent '#{farm_event.fancy_name}'."
    expect(result.errors.message[:whoops]).to eq(expected)
    expect(Point.exists?(point.id)).to be(true)
  end

  it "prevents deletion of points used by regimen fragments" do
    point = FactoryBot.create(:generic_pointer,
                              device: device,
                              x: 4,
                              y: 5,
                              z: 6)
    regimen = FactoryBot.create(:regimen,
                                device: device,
                                name: "Point user")
    Fragment.from_celery(device: device,
                         owner: regimen,
                         kind: "internal_regimen",
                         args: {},
                         body: [
                           {
                             kind: "parameter_application",
                             args: {
                               label: "location",
                               data_value: {
                                 kind: "point",
                                 args: {
                                   pointer_type: "GenericPointer",
                                   pointer_id: point.id,
                                 },
                               },
                             },
                           },
                         ])

    result = Points::Destroy.run(point_ids: [point.id], device: device)

    expect(result.success?).to be(false)
    expected = "Could not delete point at (4.0, 5.0, 6.0). Item is in use " \
               "by Regimen 'Point user'."
    expect(result.errors.message[:whoops]).to eq(expected)
    expect(Point.exists?(point.id)).to be(true)
  end

  it "reports sequence and fragment point usage in one error" do
    point = FactoryBot.create(:generic_pointer,
                              device: device,
                              x: 4,
                              y: 5,
                              z: 6)
    Sequences::Create.run!(device: device,
                           name: "Sequence user",
                           body: [
                             {
                               kind: "move_absolute",
                               args: {
                                 location: {
                                   kind: "point",
                                   args: {
                                     pointer_type: "GenericPointer",
                                     pointer_id: point.id,
                                   },
                                 },
                                 speed: 100,
                                 offset: {
                                   kind: "coordinate",
                                   args: { x: 0, y: 0, z: 0 },
                                 },
                               },
                             },
                           ])
    farm_event = FactoryBot.create(:farm_event,
                                   device: device,
                                   start_time: Time.now + 1.day)
    Fragment.from_celery(device: device,
                         owner: farm_event,
                         kind: "internal_farm_event",
                         args: {},
                         body: [
                           {
                             kind: "parameter_application",
                             args: {
                               label: "location",
                               data_value: {
                                 kind: "point",
                                 args: {
                                   pointer_type: "GenericPointer",
                                   pointer_id: point.id,
                                 },
                               },
                             },
                           },
                         ])

    result = Points::Destroy.run(point_ids: [point.id], device: device)

    expect(result.success?).to be(false)
    expect(result.errors.message_list.count).to eq(1)
    expected = "Could not delete point at (4.0, 5.0, 6.0). Item is in use " \
               "by FarmEvent '#{farm_event.fancy_name}', " \
               "Sequence 'Sequence user'."
    expect(result.errors.message[:whoops]).to eq(expected)
  end

  it "handles multiple sequence dep tracking issues at deletion time" do
    point = FactoryBot.create(:generic_pointer, device: device, x: 4, y: 5, z: 6)
    plant = FactoryBot.create(:plant, device: device, x: 0, y: 1, z: 0)
    empty_point = { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
    sequence_a = Sequences::Create.run!(device: device,
                                        name: "Sequence A",
                                        body: [
                                          {
                                            kind: "move_absolute",
                                            args: {
                                              location: {
                                                kind: "point",
                                                args: {
                                                  pointer_id: plant.id,
                                                  pointer_type: "Plant",
                                                },
                                              },
                                              speed: 100,
                                              offset: empty_point,
                                            },
                                          },
                                          {
                                            kind: "move_absolute",
                                            args: {
                                              location: {
                                                kind: "point",
                                                args: {
                                                  pointer_id: plant.id,
                                                  pointer_type: "GenericPointer",
                                                },
                                              },
                                              speed: 100,
                                              offset: empty_point,
                                            },
                                          },
                                        ])

    sequence_a = Sequences::Create.run!(device: device,
                                        name: "Sequence B",
                                        body: [
                                          {
                                            kind: "move_absolute",
                                            args: {
                                              location: {
                                                kind: "point",
                                                args: {
                                                  pointer_id: plant.id,
                                                  pointer_type: "Plant",
                                                },
                                              },
                                              speed: 100,
                                              offset: empty_point,
                                            },
                                          },
                                          {
                                            kind: "move_absolute",
                                            args: {
                                              location: {
                                                kind: "point",
                                                args: {
                                                  pointer_id: plant.id,
                                                  pointer_type: "GenericPointer",
                                                },
                                              },
                                              speed: 100,
                                              offset: empty_point,
                                            },
                                          },
                                        ])

    result = Points::Destroy
      .run(point_ids: [point.id, plant.id], device: device)
      .errors
      .message
    expected = "Could not delete plant at (0.0, 1.0, 0.0). Items are " \
               "in use by Sequence 'Sequence A', Sequence 'Sequence B'."
    expect(result[:whoops]).to eq(expected)
  end

  it "performs a hard (real) delete" do
    points = FactoryBot.create_list(:generic_pointer, 3, device: device)
    ids = points.pluck(:id)
    Points::Destroy.run!(point_ids: ids, device: device, hard_delete: true)
    expect(Point.where(id: ids).length).to eq(0)
  end

  def mark_as(resource)
    {
      kind: "update_resource",
      args: {
        resource: {
          kind: "resource",
          args: {
            resource_type: resource.class.to_s,
            resource_id: resource.id,
          },
        },
      },
      body: [
        {
          kind: "pair",
          args: {
            label: "foo",
            value: "bar",
          },
        },
      ],
    }
  end

  it "doesnt delete plants used by `resource_update`" do
    points = [
      FactoryBot.create(:generic_pointer, device: device),
      FactoryBot.create(:plant, device: device),
      FactoryBot.create(:tool_slot, device: device),
    ]
    body = points.map { |x| mark_as(x) }
    sequence = Sequences::Create.run!(device: device, name: "X", body: body)
    real_stuff = body.map do |x|
      [x.dig(:args, :resource_id), x.dig(:args, :resource_type)]
    end.to_h
    result = Points::Destroy.run(device: device, point_ids: points.map(&:id))
    expect(result.errors).to be
    message = result.errors.message.fetch("whoops")
    points.map do |p|
      expect(message).to include(p.fancy_name)
    end
  end
end
