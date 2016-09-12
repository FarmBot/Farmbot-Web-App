# User for testing purposes:
unless Rails.env == "production"
    Users::Create.run!(name:                  "Administrator",
                    email:                 "admin@admin.com",
                    password:              "password123",
                    password_confirmation: "password123")
end
