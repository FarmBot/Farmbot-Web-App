require "spec_helper"

describe Resources::Job do
  it "executes deletion for various resources" do
    puts "TODO: Test cases for points, sequences."
    device     = FactoryBot.create(:device)
    base       = \
      { body: {}, device: device, action: "destroy", uuid: SecureRandom.uuid }
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
     .map { |r| base.merge({resource: r.class, resource_id: r.id }) }
     .map do |params|
        res   = params[:resource]
        count = res.count
        Resources::Job.run!(params)
        expect(res.count).to eq(count - 1)
     end
  end

  it "deals with points later"
  it "doesn't let you delete other people's resources"
end
