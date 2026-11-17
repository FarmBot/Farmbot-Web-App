require "spec_helper"

describe Points::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:params) do
    { x: 0, y: 0, z: 0, device: device, pointer_type: "GenericPointer" }
  end

  def with_fake_limits(soft_limit = 2, hard_limit = 3)
    old_soft_limit = Points::Create::POINT_SOFT_LIMIT
    old_hard_limit = Points::Create::POINT_HARD_LIMIT

    const_reassign(Points::Create, :POINT_SOFT_LIMIT, soft_limit)
    const_reassign(Points::Create, :POINT_HARD_LIMIT, hard_limit)

    yield

    const_reassign(Points::Create, :POINT_SOFT_LIMIT, old_soft_limit)
    const_reassign(Points::Create, :POINT_HARD_LIMIT, old_hard_limit)
  end

  describe "plant start dates" do
    let(:plant_params) { params.merge(pointer_type: "Plant") }

    [
      [-5, "2017-05-29T05:00:00Z"],
      [0, "2017-05-29T00:00:00Z"],
      [5, "2017-05-28T19:00:00Z"],
    ].each do |offset, expected|
      it "interprets date-only values at device offset #{offset}" do
        allow(device).to receive(:tz_offset_hrs).and_return(offset)
        plant = Points::Create.run!(plant_params.merge(planted_at: "2017-05-29"))

        expect(plant.reload.planted_at).to eq(Time.iso8601(expected))
      end
    end

    it "uses the current offset for new plants without changing existing ones" do
      allow(device).to receive(:tz_offset_hrs).and_return(-5)
      first = Points::Create.run!(plant_params.merge(planted_at: "2017-05-29"))
      allow(device).to receive(:tz_offset_hrs).and_return(-6)
      second = Points::Create.run!(plant_params.merge(planted_at: "2017-05-29"))

      expect(first.reload.planted_at).to eq(Time.iso8601("2017-05-29T05:00:00Z"))
      expect(second.reload.planted_at).to eq(Time.iso8601("2017-05-29T06:00:00Z"))
    end

    ["2017-05-29T12:34:56Z", "2017-05-29T07:34:56-05:00"].each do |timestamp|
      it "preserves the instant in #{timestamp}" do
        allow(device).to receive(:tz_offset_hrs).and_return(5)
        plant = Points::Create.run!(plant_params.merge(planted_at: timestamp))

        expect(plant.reload.planted_at).to eq(Time.iso8601(timestamp))
      end
    end

    it "preserves Time inputs" do
      timestamp = Time.utc(2017, 5, 29, 12, 34, 56)
      plant = Points::Create.run!(plant_params.merge(planted_at: timestamp))

      expect(plant.reload.planted_at).to eq(timestamp)
    end

    it "leaves an omitted start date unset" do
      plant = Points::Create.run!(plant_params)

      expect(plant.reload.planted_at).to be_nil
    end

    it "leaves other point types' date parsing unchanged" do
      allow(device).to receive(:tz_offset_hrs).and_return(5)
      point = Points::Create.run!(params.merge(planted_at: "2017-05-29"))

      expect(point.reload.planted_at).to eq(Time.parse("2017-05-29"))
    end
  end

  it "warns users when they hit the soft resource limit" do
    with_fake_limits do
      allow(device).to receive(:tell).with(Points::Create::GETTING_CLOSE, ["fatal_email"])
      Points::Create::POINT_SOFT_LIMIT.times do
        expect(Points::Create.run(params).errors).to be nil
      end
    end
  end

  it "creates a gantry_mounted tool slot" do
    p = { x: 0,
          y: 10,
          z: -100,
          device: FactoryBot.create(:device),
          gantry_mounted: true,
          mount_offset_x: 1.5,
          mount_offset_y: 2.5,
          mount_offset_z: 3.5,
          mount_stage: ToolSlot::MOUNT_STAGE_X,
          pointer_type: "ToolSlot" }
    slot = Points::Create.run!(p)

    p.map { |(k, v)| expect(slot.send(k)).to eq(v) }
  end

  it "stops users when they hit the hard limit" do
    with_fake_limits do
      params = { x: 0,
                 y: 0,
                 z: 0,
                 device: device,
                 pointer_type: "GenericPointer" }

      Points::Create::POINT_HARD_LIMIT.times do
        expect(Points::Create.run(params).errors).to be nil
      end

      errors = Points::Create.run(params).errors
      expect(errors).to be
      expect(errors.fetch("point_limit")).to be
    end
  end

  it "validates curve ids: ok" do
    water_curve = FactoryBot.create(:curve, type: "water", device: device)
    spread_curve = FactoryBot.create(:curve, type: "spread", device: device)
    height_curve = FactoryBot.create(:curve, type: "height", device: device)
    params = { x: 0,
               y: 0,
               z: 0,
               water_curve_id: water_curve.id,
               spread_curve_id: spread_curve.id,
               height_curve_id: height_curve.id,
               device: device,
               pointer_type: "GenericPointer" }
    expect(Points::Create.run(params).errors).to be nil
  end

  it "validates curve ids: ko" do
    curve = FactoryBot.create(:curve, type: "water", device: device)
    params = { x: 0,
               y: 0,
               z: 0,
               water_curve_id: -1,
               height_curve_id: -1,
               spread_curve_id: -1,
               device: device,
               pointer_type: "GenericPointer" }

    errors = Points::Create.run(params).errors
    expect(errors).to be
    expect(errors.fetch("water_curve_id")).to be
    expect(errors.fetch("spread_curve_id")).to be
    expect(errors.fetch("height_curve_id")).to be
  end
end
