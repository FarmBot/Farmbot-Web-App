require "spec_helper"

describe Resources::Job do
  it "executes deletion for various resources" do
    puts "TODO: Test cases for points, sequences."
    device     = FactoryBot.create(:device)
    base       = \
      { body: {}, device: device, action: "destroy", uuid: SecureRandom.uuid }

    test_cases = [
      # DeviceConfig,
      # DiagnosticDump,
      # FarmEvent,
      # FarmwareInstallation,
      # Image,
      # Log,
      # PlantTemplate,
      # Point,
      # Regimen,
      # SavedGarden,
      # SensorReading,
      WebcamFeed,
      Peripheral,
      PinBinding,
      Sensor,
      Tool,
    ]
     .each{ |k| k.destroy_all }
     .map { |k| FactoryBot.create(k.model_name.singular.to_sym, device: device) }
     .concat([FakeSequence.create( device: device)])
     .map { |r| base.merge({resource: r.class, resource_id: r.id }) }
     .map do |params|
        res   = params[:resource]
        count = res.count
        expect(count).to eq(1)
        Resources::Job.run!(params)
        expect(res.count).to eq(0)
     end
  end

  it "deals with points later"
  it "doesn't let you delete other people's resources"
end
