require "spec_helper"

describe Users::Create do
  it "enforces terms of service" do
    const_reassign(User, :ENFORCE_TOS, true)
    results = Users::Create.run(email:                 "xyz1@qwerty.io",
                                name:                  "Faker",
                                password:              "password12345",
                                password_confirmation: "password12345",
                                agree_to_terms:        false)
    tos = results.errors.message["terms_of_service"] || ""
    expect(tos).to include("must agree")
    const_reassign(User, :ENFORCE_TOS, false)
  end

  it "opts out of terms of service" do
    const_reassign(User, :ENFORCE_TOS, false)
    results = Users::Create.run(email:                 "xyz2@qwerty.io",
                                name:                  "Faker",
                                password:              "password12345",
                                password_confirmation: "password12345",
                                agree_to_terms:        false)
    expect(results.success?).to be_truthy
  end

    it "stops unauthorized users from creating accounts on server" do
      ClimateControl.modify(TRUSTED_DOMAINS: "farmbot.io,farm.bot") do
        email   = "#{SecureRandom.hex(8)}@qwerty.io"
        results = Users::Create.run(email:                 email,
                                    name:                  "Faker",
                                    password:              "password12345",
                                    password_confirmation: "password12345",
                                    agree_to_terms:        false)

        expect(results.success?).to be false
        errors = results.errors.message_list
        expect(errors).to include(Users::Create::CANT_USE_SERVER)
      end
    end

    it "allows people on the TRUSTED_DOMAINS list to register" do
      emails = ["farmbot.io","farm.bot"]
      ClimateControl.modify(TRUSTED_DOMAINS: emails.join(",")) do
        email = "#{SecureRandom.hex(8)}@#{emails.sample}"
        results = Users::Create.run(email:                 email,
                                    name:                  "Faker",
                                    password:              "password12345",
                                    password_confirmation: "password12345",
                                    agree_to_terms:        false)
        expect(results.success?).to be true
      end
    end

    it "stops users from registering twice" do
      email   = (User.last || FactoryBot.create(:user)).email
      results = Users::Create.run(email:                 email,
                                  name:                  "Faker",
                                  password:              "password12345",
                                  password_confirmation: "password12345",
                                  agree_to_terms:        false)
      expect(results.success?).to be false
      errors = results.errors.message_list
      expect(errors).to include(Users::Create::ALREADY_REGISTERED)
    end
end
