unless Rails.env == "production"
    ENV['MQTT_HOST']        = "blooper.io"
    ENV['OS_UPDATE_SERVER'] = "http://blah.com"
    ENV['FW_UPDATE_SERVER'] = "http://test.com"
    User.delete_all
    Point.delete_all
    Device.delete_all
    Users::Create.run!(name:                  "Administrator",
                       email:                 "notos@notos.com",
                       password:              "password123",
                       password_confirmation: "password123",
                       agree_to_terms:        true)
    no_tos = User.last
    no_tos.agreed_to_terms_at = nil
    no_tos.verified_at = Time.now
    no_tos.save(validate: false)
    Users::Create.run!(name:                  "Administrator",
                       email:                 "admin@admin.com",
                       password:              "password123",
                       password_confirmation: "password123",
                       agree_to_terms:        true)
    u = User.last
    u.update_attributes(verified_at: Time.now)
    Log.transaction do
      FactoryGirl.create_list(:log, 35, device: u.device)
    end
    [ "http://i.imgur.com/XvFBGA4.jpg",
      "http://i.imgur.com/XsFczCY.jpg" ].each do |url|
        Images::Create.run!(attachment_url: url, device: u.device)
    end
    10.times do
      Plant.create(
        device: u.device,
        x: rand(1...550),
        y: rand(1...550),
        name: Haikunator.haikunate,
        img_url: "http://placehold.it/200x150",
        icon_url: "/icons/Natural Food-96.png",
        openfarm_slug: "tomato")
    end
    100.times do
      Point.create(
        device: u.device,
        x: rand(1...225) + rand(1...225),
        y: rand(1...225) + rand(1...225),
        z: 5,
        radius: rand(1...150) + rand(1...150),
        meta: { created_by: "plant-detection" })
    end

    s = Sequences::Create.run!(device: u.device,
    name: "Goto 0, 0, 0",
    body: [{kind:"move_absolute",args:{location:{kind:"coordinate", args:{x:0,
    y:0, z:0}}, offset:{kind:"coordinate", args:{x:0, y:0, z:0}}, speed:800}}])

    Regimens::Create.run(device: u.device,
                         name:"Test Regimen 456",
                         color:"gray",
                         regimen_items: [
                           {time_offset:300000, sequence_id:s.id},
                           {time_offset:173100000, sequence_id:s.id},
                           {time_offset:345900000, sequence_id:s.id}
                         ])
    Peripherals::Create.run!(device:u.device, peripherals: [{pin: 13, label: "LED"}])
    Tools::Create.run!(name: "Trench Digging Tool", device: u.device)
    5.times do
      FarmEvents::Create.run!(
        device: u.device,
        start_time: Date.yesterday - [*(1..3)].sample.days,
        end_time: Date.today + ([*(3..8)].sample).days,
        time_unit: "daily",
        repeat: [*(1..3)].sample,
        executable_id: Sequence.where(device: u.device).order("RANDOM()").first.id,
        executable_type: "Sequence"
      )
    end
end
