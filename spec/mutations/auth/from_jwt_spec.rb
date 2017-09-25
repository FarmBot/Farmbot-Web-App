require "spec_helper"

describe Auth::FromJWT do
  let(:user)  { FactoryGirl.create(:user) }
  let(:token) { SessionToken.issue_to(user).encoded }
  fake = lambda (sub) {
    AbstractJwtToken.new([{ sub:              sub,
                            iat:              Time.now.to_i,
                            jti:              SecureRandom.uuid,
                            iss:              $API_URL,
                            exp:              40.days.from_now.to_i,
                            mqtt:             "//foo.bar",
                            os_update_server: "/foo.bar/baz.json",
                            bot:              "device_123" }]).encoded
  }

  it "gets user from jwt" do
    result = Auth::FromJWT.run!(jwt: token)
    expect(result).to eq(user)
  end

  it "allows emails as a `sub` field, but only until 25 OCT 17" do
    t = fake[user.email]
    result = Auth::FromJWT.run!(jwt: t)
    expect(result).to eq(user)
  end

  it "crashes when sub is neither string nor Integer" do
    t       = fake[1.23]
    bad_sub = "SUB was neither string nor number"
    expect { Auth::FromJWT.run!(jwt: t) }.to raise_error(bad_sub)
  end
end
