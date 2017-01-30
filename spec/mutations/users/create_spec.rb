require 'spec_helper'

describe Users::Create do
  it 'enforces terms of service' do
    User::ENFORCE_TOS = true
    results = Users::Create.run(email:                 "xyz@qwerty.io",
                                name:                  "Faker",
                                password:              "password12345",
                                password_confirmation: "password12345",
                                agree_to_terms:        false)
    tos = results.errors.message["terms_of_service"] || ""
    expect(tos).to include("must agree")
    User::ENFORCE_TOS = false
  end

  it 'opts out of terms of service' do
    User::ENFORCE_TOS = false
    results = Users::Create.run(email:                 "xyz@qwerty.io",
                                name:                  "Faker",
                                password:              "password12345",
                                password_confirmation: "password12345",
                                agree_to_terms:        false)
    expect(results.success?).to be_truthy
  end
end
