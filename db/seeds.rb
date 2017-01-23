# User for testing purposes:
unless Rails.env == "production"
    ENV['MQTT_HOST']        = "blooper.io"
    ENV['OS_UPDATE_SERVER'] = "http://blah.com"
    ENV['FW_UPDATE_SERVER'] = "http://test.com"
    User.delete_all
    Device.delete_all
    Users::Create.run!(name:                   "Administrator",
                         email:                 "admin@admin.com",
                         password:              "password123",
                         password_confirmation: "password123")
    User.last.update_attributes(verified_at: Time.now)
    Log.transaction do
      FactoryGirl.create_list(:log, 35, device: User.last.device)
    end

    10.times do
      Plant.create(
        device: User.last.device,
        x: rand(1...100),
        y: rand(1...100),
        name: Haikunator.haikunate,
        img_url: "http://placehold.it/200x150",
        icon_url: "/icons/Natural Food-96.png",
        openfarm_slug: "tomato",
        planted_at: Time.now.utc)
    end
end
