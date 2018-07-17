require "spec_helper"

describe Resources::Job do
  base = { body: {}, action: "destroy", uuid: SecureRandom.uuid }

  it "executes deletion for various resources" do
    puts "TODO: Test cases for points, sequences."
    device     = FactoryBot.create(:device)
    test_cases = [
      WebcamFeed,
      FarmEvent,
      Image,
      Log,
      PlantTemplate,
      SavedGarden,
      SensorReading,
      Peripheral,
      FarmwareInstallation,
      PinBinding,
      Sensor,
      Regimen,
      # Tool,
      # Point,
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

  it "deals with points"
end
