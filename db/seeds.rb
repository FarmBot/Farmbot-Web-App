if Rails.env == "development"
  POINT_COUNT = 8
  PLANT_COUNT = 8
  DATE_RANGE_LO = 1..3
  DATE_RANGE_HI = 3..8
  ENV["MQTT_HOST"] = "blooper.io"
  # CREDIT: Faker Ruby Gem
  VEGGIES = %w(artichoke arugula asparagus broccoli cabbage carrot cauliflower
               celery cucumber eggplant garlic kale kohlrabi leek lettuce okra
               parsnip potato pumpkin radicchio radish raspberry spinach squash
               tomato turnip zucchini)

  [
    Curve,
    FarmwareEnv,
    WizardStepResult,
    Alert,
    Sensor,
    Peripheral,
    Log,
    PinBinding,
    PointGroupItem,
    PointGroup,
    Point,
    TokenIssuance,
    ToolSlot,
    User,
    PlantTemplate,
    SavedGarden,
    SensorReading,
    FarmwareInstallation,
    Tool,
    Delayed::Job,
    Delayed::Backend::ActiveRecord::Job,
    Fragment,
    Device,
  ].map(&:delete_all)
  Users::Create.run!(name: "Test",
                     email: "test@test.com",
                     password: "password123",
                     password_confirmation: "password123",
                     confirmed_at: Time.now,
                     agreed_to_terms_at: Time.now,
                     skip_email: true)
  User.update_all(confirmed_at: Time.now,
                  agreed_to_terms_at: Time.now)
  u = User.last
  u.update(device: Devices::Create.run!(user: u))
  # === Parameterized Sequence stuff
  json = JSON.parse(File.read("spec/lib/celery_script/ast_fixture5.json"), symbolize_names: true)
  Sequences::Create.run!(json, device: u.device)
  # === Parameterized Sequence stuff
  Log.transaction do
    FactoryBot.create_list(:log, 35, device: u.device)
  end
  ["https://via.placeholder.com/350x250?text=Image%20Zero",
   "https://i.imgur.com/XvFBGA4.jpg",
   "https://via.placeholder.com/350x250?text=Image%20Two",
   "https://i.imgur.com/XsFczCY.jpg",
   "https://via.placeholder.com/350x250?text=Image%20Four"].each do |url|
    Images::Create.run!(attachment_url: url,
                        device: u.device,
                        meta: { x: rand(40...970),
                                y: rand(40...470),
                                z: rand(1...300) })
  end

  all_of_em = []
  1.upto(8) do |n1|
    1.upto(8) do |n2|
      veggie = VEGGIES.sample
      p = Plant.create(device: u.device,
                       x: n1 * 80,
                       y: n2 * 80,
                       radius: rand(20...70),
                       name: veggie,
                       openfarm_slug: veggie.downcase.gsub(" ", "-"))
      all_of_em.push(p.id)
    end
  end

  PointGroups::Create.run!(device: u.device,
                           name: "TEST GROUP I",
                           point_ids: all_of_em.sample(8),
                           sort_type: "random")

  Device.all.map { |device| SavedGardens::Snapshot.run!(device: device) }

  POINT_COUNT.times do
    GenericPointer.create(device: u.device,
                          x: rand(40...970) + rand(40...970),
                          y: rand(40...470) + rand(40...470),
                          z: 5,
                          radius: (rand(1...150) + rand(1...150)) / 20,
                          meta: {
                            created_by: "plant-detection",
                            color: (Sequence::COLORS + [nil]).sample,
                          })
  end
  body000 = [{
    kind: "move_absolute",
    args: {
      location: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 100
    }
  }]
  s = Sequences::Create.run!(device: u.device,
                             name: "Goto 0, 0, 0",
                             body: body000)
  t = Tools::Create.run!(name: "Trench Digging Tool", device: u.device)
  body_txt = File.read("spec/lib/celery_script/ast_fixture4.json")
                 .gsub("__SEQUENCE_ID__", s[:id].to_s)
                 .gsub("__TOOL_ID__", t.id.to_s)
  Sequences::Create.run!(device: u.device,
                         name: "Every Node",
                         body: JSON.parse(body_txt))
  Regimens::Create.run(device: u.device,
                       name: "Test Regimen 456",
                       color: "gray",
                       regimen_items: [
                         { time_offset: 300000, sequence_id: s[:id] },
                         { time_offset: 173100000, sequence_id: s[:id] },
                         { time_offset: 345900000, sequence_id: s[:id] },
                       ])
  Peripherals::Create.run!(device: u.device, pin: 13, label: "LED")
  WebcamFeeds::Create.run!(device: u.device,
                           name: "My Feed 1",
                           url: "https://nature.nps.gov/air/webcams/parks/yosecam/yose.jpg")
  ts = Points::Create.run!(device: u.device,
                           tool_id: t.id,
                           name: "Slot One.",
                           x: 10,
                           y: 10,
                           z: 10,
                           pointer_type: "ToolSlot")
  d = u.device
  Sensors::Create
    .run!(device: d, pin: 14, label: "Stub sensor", mode: 0)
  User.update_all(confirmed_at: Time.now)
  [
    [1200.0, 999.8, -379.0],
    [1648.0, 480.0, -379.0],
    [976.0, 1129.6, -380.0],
    [1200.0, 1259.8, -380.0],
    [1648.0, 1000.8, -380.0],
    [1200.0, 740.2, -381.0],
    [1199.8, 1001.2, -381.0],
    [1647.8, 480.0, -382.0],
    [80.0, 610.0, -382.0],
    [528.2, 1390.0, -382.0],
    [1200.0, 480.0, -383.0],
    [752.0, 480.0, -383.0],
    [528.0, 1390.0, -384.0],
    [80.0, 610.0, -384.0],
    [304.2, 740.0, -384.0],
    [751.8, 480.0, -384.0],
    [975.8, 610.0, -384.0],
    [1200.0, 480.0, -384.0],
    [752.2, 1260.0, -384.0],
    [1647.8, 1260.0, -385.0],
    [1423.8, 610.0, -386.0],
    [80.0, 1130.0, -386.0],
    [1647.8, 219.8, -387.0],
    [528.0, 1130.0, -387.0],
    [528.2, 610.0, -387.0],
    [80.0, 870.0, -389.0],
    [752.0, 740.4, -389.0],
    [528.2, 870.0, -389.0],
    [80.0, 1130.0, -391.0],
    [752.2, 1000.2, -391.0],
    [975.8, 870.0, -391.0],
    [528.0, 610.4, -391.0],
    [1200.0, 220.0, -393.0],
    [528.0, 1130.4, -393.0],
    [304.0, 1259.8, -393.0],
    [1423.8, 350.0, -394.0],
    [975.8, 349.8, -394.0],
    [304.0, 220.0, -394.0],
    [304.0, 220.0, -396.0],
    [304.0, 1000.0, -396.0],
    [752.2, 219.8, -396.0],
    [304.0, 480.0, -396.0],
    [304.0, 1001.2, -398.0],
  ].map do |(x, y, z)|
    Points::Create.run!(device: u.device,
                        name: "Soil",
                        pointer_type: "GenericPointer",
                        x: x,
                        y: y,
                        z: z,
                        meta: { "at_soil_level" => true })
  end
end
