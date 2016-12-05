FactoryGirl.define do
  factory :token_expiration do
    sub "MyString"
    exp ""
    jti "MyString"
  end
end
