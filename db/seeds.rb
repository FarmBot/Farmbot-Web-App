
if Rails.env == "development"
  POINT_COUNT = 8
  PLANT_COUNT = 8
  DATE_RANGE_LO = 1..3
  DATE_RANGE_HI = 3..8
  ENV["MQTT_HOST"] = "blooper.io"
  ENV["OS_UPDATE_SERVER"] = "http://example-server.com"
  # CREDIT: Faker Ruby Gem
  VEGGIES = %w(artichoke arugula asparagus broccoli cabbage carrot cauliflower
               celery cucumber eggplant garlic kale kohlrabi leek lettuce okra
               parsnip potato pumpkin radicchio radish raspberry spinach squash
               tomato turnip zucchini)

  [
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
    Device,
    Delayed::Job,
    Delayed::Backend::ActiveRecord::Job,
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

  s = Sequences::Create.run!(device: u.device,
                             name: "Goto 0, 0, 0",
                             body: [{ kind: "move_absolute", args: { location: { kind: "coordinate", args: { x: 0,
                                                                                                             y: 0, z: 0 } }, offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }, speed: 100 } }])
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
end
