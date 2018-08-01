require "spec_helper"

describe Resources::Job do
  base = { body: {}, action: "destroy", uuid: SecureRandom.uuid }

  it "executes deletion for various resources" do
    device     = FactoryBot.create(:device)
    test_cases = [
      FarmEvent,
      FarmwareInstallation,
      Image,
      Log,
      Peripheral,
      PinBinding,
      PlantTemplate,
      Regimen,
      SavedGarden,
      Sensor,
      SensorReading,
      WebcamFeed,
    ]
    .each{ |k| k.delete_all }
    .map { |k| FactoryBot.create(k.model_name.singular.to_sym, device: device) }
     .concat([FakeSequence.create( device: device)])
     .map do |r|
      base.merge({resource: r.class, resource_id: r.id, device: device})
     end
     .map do |params|
        res   = params[:resource]
        count = res.count
        Resources::Job.run!(params)
        expect(res.count).to eq(count - 1)
     end
  end

  it "doesn't let you delete other people's resources" do
    device_a   = FactoryBot.create(:device)
    device_b   = FactoryBot.create(:device)
    farm_event = FactoryBot.create(:farm_event, device: device_b)
    params     = base.merge(resource:    FarmEvent,
                            resource_id: farm_event.id,
                            device:      device_a)
    result = Resources::Job.run(params)
    expect(result.success?).to be false
    expect(result.errors.message_list).to include(Resources::Job::NOT_FOUND)
  end

  it "deals with edge case resource snooping" do
    device_a   = FactoryBot.create(:device)
    device_b   = FactoryBot.create(:device)
    farm_event = FactoryBot.create(:farm_event, device: device_b)
    FD         = CreateDestroyer.run!(resource: FarmEvent)
    result     = FD.run(farm_event: farm_event, device: device_a)
    errors     = result.errors.message_list
    expect(errors).to include("You do not own that farm_event")
  end

  it "updates points" do
    point  = FactoryBot.create(:generic_pointer)
    result = Resources::Job.run!(body:        {name: "Heyo!"},
                                 resource:    Point,
                                 resource_id: point.id,
                                 device:      point.device,
                                 action:      "save",
                                 uuid:        "whatever")
    expect(result).to be_kind_of(GenericPointer)
    expect(result.name).to eq("Heyo!")
  end

  it "updates a tool" do
    tool   = FactoryBot.create(:tool)
    result = Resources::Job.run!(body:        {name: "Heyo!"},
                                 resource:    Tool,
                                 resource_id: tool.id,
                                 device:      tool.device,
                                 action:      "save",
                                 uuid:        "whatever")
    expect(result).to be_kind_of(Tool)
    expect(result.name).to eq("Heyo!")
  end

  it "can't update someone elses tool" do
    theirs = FactoryBot.create(:tool)
    them   = theirs.device
    me     = FactoryBot.create(:device)
    result = Resources::Job.run(body:        {name: "Heyo!"},
                                resource:    Tool,
                                resource_id: theirs.id,
                                device:      me,
                                action:      "save",
                                uuid:        "whatever")
    expect(result.errors.message_list).to include(Resources::Job::NOT_FOUND)
    expect(theirs.reload.name).not_to eq("Heyo!")
  end

  it "updates a saved_garden" do
    saved_garden = FactoryBot.create(:saved_garden)
    result       = Resources::Job.run!(body:        {name: "Heyo!"},
                                       resource:    SavedGarden,
                                       resource_id: saved_garden.id,
                                       device:      saved_garden.device,
                                       action:      "save",
                                       uuid:        "whatever")
    expect(result).to be_kind_of(SavedGarden)
    expect(result.name).to eq("Heyo!")
  end

  it "updates a plant_template" do
    plant_template = FactoryBot.create(:plant_template)
    result         = Resources::Job.run!(body:        {name: "Heyo!"},
                                         resource:    PlantTemplate,
                                         resource_id: plant_template.id,
                                         device:      plant_template.device,
                                         action:      "save",
                                         uuid:        "whatever")
    expect(result).to be_kind_of(PlantTemplate)
    expect(result.name).to eq("Heyo!")
  end

  it "deals with points" do
    device = FactoryBot.create(:device)
    Devices::Destroy
    params = [
      FactoryBot.create(:generic_pointer, device: device),
      FactoryBot.create(:plant,           device: device),
      FactoryBot.create(:tool_slot,       device: device)
    ].map do |r|
      base.merge({resource: Point, resource_id: r.id, device: device})
    end
    .map do |params|
      res   = params[:resource]
      count = res.where(discarded_at: nil).count
      Resources::Job.run!(params)
      expect(res.where(discarded_at: nil).count).to eq(count - 1)
    end
  end
end
