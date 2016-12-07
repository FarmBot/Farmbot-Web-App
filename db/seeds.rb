# User for testing purposes:
unless Rails.env == "production"
    ENV['MQTT_HOST']        = "blooper.io"
    ENV['OS_UPDATE_SERVER'] = "http://blah.com"
    ENV['FW_UPDATE_SERVER'] = "http://test.com"
    User.where(email: "admin@admin.com").destroy_all
    user = Users::Create.run!(name:                   "Administrator",
                              email:                 "admin@admin.com",
                              password:              "password123",
                              password_confirmation: "password123")
    FactoryGirl.create_list(:log, 35, device: User.last.device)
end
