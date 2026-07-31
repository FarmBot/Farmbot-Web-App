require 'spec_helper'

describe Users::Update do

  it 'does not allow user to change their email address to one that is in use' do
    Users::Create.run!(email:                 "xyz@qwerty.io",
                       name:                  "Faker",
                       password:              "password12345",
                       password_confirmation: "password12345",
                       agree_to_terms:        true)
    u  = User.last
    u2 = FactoryBot.create(:user)
    Users::Update.run!(user: u, email: u.email)
    result = Users::Update.run(user: u, email: u2.email)
    expect(result.success?).to be(false)
    expect(result.errors.message_list).to include(Users::Update::EMAIL_IN_USE)
  end

  it 'ignores unchanged emails' do
    u = FactoryBot.create(:user)
    # "useless" update to user record.
    result = Users::Update.run(user: u, email: u.email)
    expect(result.success?).to be(true)
    expect(u.reload.unconfirmed_email).to eq(nil)
  end

  it 'changes email addresses' do
    u = FactoryBot.create(:user)
    original_token = u.confirmation_token
    expect(u.unconfirmed_email?).to be false
    Users::Update.run!(user: u, email: "example@mailinator.com")

    if User::SKIP_EMAIL_VALIDATION
      expect(u.unconfirmed_email?).to be false
      expect(u.email).to eq("example@mailinator.com")
    else
      expect(u.unconfirmed_email?).to be true
      expect(u.unconfirmed_email).to eq("example@mailinator.com")
      expect(u.confirmation_token).not_to eq(original_token)
    end
  end

  it "rejects an invalid email address" do
    user = FactoryBot.create(:user)
    result = Users::Update.run(user: user, email: "not-an-email")

    expect(result.success?).to be false
    expect(result.errors.message_list)
      .to include(Users::Update::INVALID_EMAIL)
  end

  it "stops users from changing to an unauthorized email domain" do
    user = FactoryBot.create(:user)

    ClimateControl.modify(TRUSTED_DOMAINS: "farmbot.io,farm.bot") do
      result = Users::Update.run(user: user, email: "example@mailinator.com")

      expect(result.success?).to be false
      expect(result.errors.message_list)
        .to include(Users::Update::CANT_USE_SERVER)
    end
  end

  it "allows users to change to an authorized email domain" do
    user = FactoryBot.create(:user)

    ClimateControl.modify(TRUSTED_DOMAINS: "farmbot.io, farm.bot") do
      result = Users::Update.run(user: user, email: "example@farm.bot")

      expect(result.success?).to be true
    end
  end

  it "does not check the domain when no email change is requested" do
    email = "#{SecureRandom.hex(8)}@mailinator.com"
    user = FactoryBot.create(:user, email: email)

    ClimateControl.modify(TRUSTED_DOMAINS: "farmbot.io") do
      result = Users::Update.run(user: user, name: "New Name")

      expect(result.success?).to be true
    end
  end
end
