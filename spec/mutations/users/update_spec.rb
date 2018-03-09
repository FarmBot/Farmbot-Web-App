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
    expect(u.unconfirmed_email?).to be false
    Users::Update.run!(user: u, email: "example@mailinator.com")
    expect(u.unconfirmed_email?).to be true
    expect(u.unconfirmed_email).to eq("example@mailinator.com")
  end
end
