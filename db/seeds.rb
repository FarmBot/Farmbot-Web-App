unless Rails.env == "production"
    ToolSlot.destroy_all
    Tool.destroy_all
    Point.destroy_all
    LogDispatch.destroy_all

    User.destroy_all
    POINT_COUNT             = 2
    PLANT_COUNT             = 2
    DATE_RANGE_LO           = 1..3
    DATE_RANGE_HI           = 3..8
    ENV['MQTT_HOST']        = "blooper.io"
    ENV['OS_UPDATE_SERVER'] = "http://non_legacy_update_url.com"
    Point.destroy_all
    Device.destroy_all
    User.destroy_all
    Users::Create.run!(name:                  "Administrator",
                       email:                 "farmbot@farmbot.io",
                       password:              "password123",
                       password_confirmation: "password123",
                       agree_to_terms:        true)
    signed_tos = User.last
    signed_tos.agreed_to_terms_at = nil
    signed_tos.confirmed_at = Time.now
    signed_tos.save(validate: false)
    Users::Create.run!(name:                  "Administrator",
                       email:                 "admin@admin.com",
                       password:              "password123",
                       password_confirmation: "password123",
                       agree_to_terms:        true)
    u = User.last
    u.update_attributes(confirmed_at: Time.now)
    Log.transaction do
      FactoryBot.create_list(:log, 35, device: u.device)
    end
    [ "https://via.placeholder.com/350x250?text=Image%20Zero",
      "https://i.imgur.com/XvFBGA4.jpg",
      "https://via.placeholder.com/350x250?text=Image%20Two",
      "https://i.imgur.com/XsFczCY.jpg",
      "https://via.placeholder.com/350x250?text=Image%20Four"
    ].each do |url|
        Images::Create.run!(attachment_url: url,
                            device: u.device,
                            meta: {x: rand(40...970),
                                   y: rand(40...470),
                                   z: rand(1...300)})
    end

    PLANT_COUNT.times do
      Point.create(
        device: u.device,
        x: rand(40...970),
        y: rand(40...470),
        radius: rand(10...50),
        name: Haikunator.haikunate,
        pointer: Plant.new(
          openfarm_slug: ["tomato", "carrot", "radish", "garlic"].sample
        ))
    end

    POINT_COUNT.times do
      Point.create(
        device: u.device,
        x: rand(40...970) + rand(40...970),
        y: rand(40...470) + rand(40...470),
        z: 5,
        radius: (rand(1...150) + rand(1...150)) / 20,
        pointer: GenericPointer.new(),
        meta: {
          created_by: "plant-detection",
          color: (Sequence::COLORS + [nil]).sample
        })
    end

    s = Sequences::Create.run!(device: u.device,
    name: "Goto 0, 0, 0",
    body: [{kind:"move_absolute",args:{location:{kind:"coordinate", args:{x:0,
    y:0, z:0}}, offset:{kind:"coordinate", args:{x:0, y:0, z:0}}, speed:100}}])
    t  = Tools::Create.run!(name: "Trench Digging Tool", device: u.device)
    body_txt = File.read("spec/lib/celery_script/ast_fixture4.json")
                   .gsub("__SEQUENCE_ID__", s[:id].to_s)
                   .gsub("__TOOL_ID__", t.id.to_s)
    Sequences::Create.run!(device: u.device,
        name: "Every Node",
        body: JSON.parse(body_txt))
    Regimens::Create.run(device: u.device,
                         name:"Test Regimen 456",
                         color:"gray",
                         regimen_items: [
                           {time_offset:300000, sequence_id:s[:id]},
                           {time_offset:173100000, sequence_id:s[:id]},
                           {time_offset:345900000, sequence_id:s[:id]}
                         ])
    Peripherals::Create.run!(device: u.device, pin: 13, label: "LED")
    2.times do
        FarmEvents::Create.run!(
          device: u.device,
          start_time: Time.now + 1.hour,
          end_time: Date.today + ([*(DATE_RANGE_HI)].sample).days,
          time_unit: "daily",
          repeat: [*(DATE_RANGE_LO)].sample,
          executable_id: Sequence.where(device: u.device).order("RANDOM()").first.id,
          executable_type: "Sequence")
    end
    WebcamFeeds::Create.run!(device: u.device,
                            name: "My Feed 1",
                            url: "https://nature.nps.gov/air/webcams/parks/yosecam/yose.jpg")
    ts = ToolSlots::Create.run!(device: u.device,
                                tool_id: t.id,
                                name: "Slot One.",
                                x: 10,
                                y: 10,
                                z: 10)
    d = u.device
    PinBindings::Create
      .run!(device: d, sequence_id: d.sequences.sample.id, pin_num: 15,)
    Sensors::Create
      .run!(device: d, pin: 14, label: "Stub sensor", mode: 0)
  end
