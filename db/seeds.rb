# User for testing purposes:
unless Rails.env == "production"
    ENV['MQTT_HOST']        = "blooper.io"
    ENV['OS_UPDATE_SERVER'] = "http://blah.com"
    ENV['FW_UPDATE_SERVER'] = "http://test.com"
    User.where(email: "admin@admin.com").destroy_all
    Users::Create.run!(name:                   "Administrator",
                       email:                 "admin@admin.com",
                       password:              "password123",
                       password_confirmation: "password123")
    User.last.update_attributes(verified_at: Time.now)
    Log.transaction do
      FactoryGirl.create_list(:log, 35, device: User.last.device)
    end
end
