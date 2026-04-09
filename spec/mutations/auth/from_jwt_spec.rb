require "spec_helper"

describe Auth::FromJwt do
  let(:user) { FactoryBot.create(:user) }
  let(:token) do
    SessionToken.issue_to(user).encoded
  end

  fake = ->(sub) {
    AbstractJwtToken.new([{ sub: sub,
                            iat: Time.now.to_i,
                            jti: SecureRandom.uuid,
                            iss: $API_URL,
                            exp: 40.days.from_now.to_i,
                            mqtt: "//foo.bar",
                            bot: "device_123" }]).encoded
  }

  it "gets user from jwt" do
    result = Auth::FromJwt.run!(jwt: token)
    expect(result).to eq(user)
  end
end
