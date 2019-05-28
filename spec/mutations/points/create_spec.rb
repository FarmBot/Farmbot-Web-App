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
end
