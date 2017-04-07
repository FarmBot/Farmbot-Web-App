require 'spec_helper'

describe Users::Update do

  it 'does not allow user to change their email address to one that is in use' do
    Users::Create.run!(email:                 "xyz@qwerty.io",
                       name:                  "Faker",
                       password:              "password12345",
                       password_confirmation: "password12345",
                       agree_to_terms:        true)
   u  = User.last
   u2 = FactoryGirl.create(:user)
   Users::Update.run!(user: u, email: u.email)
   result = Users::Update.run(user: u, email: u2.email)
   expect(result.success?).to be(false)
   expect(result.errors.message_list).to include(Users::Update::EMAIL_IN_USE)
  end
end
