# Populate some fake users.
[*(1000...1010)].each do |id|
  begin
    Users::Create.run!(name:                 "FarmBotanist #{id}",
                      email:                 "farmbot#{id}@farmbot.io",
                      password:              "",
                      password_confirmation: "",
                      agree_to_terms:        true)
    User
      .last
      .update_attributes(verified_at: Time.now, agreed_to_terms_at: Time.now)
  rescue
    puts "Skipping #{id}"
  end
end
