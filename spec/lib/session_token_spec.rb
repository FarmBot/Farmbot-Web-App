require 'spec_helper'

describe SessionToken do
  let(:user) { FactoryBot.create(:user) }

  FAKE_TOKEN = [
        { "sub"  => "admin@admin.com",
          "iat"  => 1474570171,
          "jti"  => "c315f378-a318-4d4c-ba06-e4544cbc0621",
          "iss"  => "//localhost:3000",
          "exp"  => 1474915771,
          "mqtt" => "localhost",
          "bot"  => "04b57247-763a-4e99-b1a7-3743fe946a1a" },
        { "typ"  => "JWT",
            "alg"  => "RS256" }
      ]

  it 'initializes' do
    token = SessionToken.new(FAKE_TOKEN)
    expect(token.unencoded).to be_kind_of(Hash)
    actual   = token.unencoded
    expected = FAKE_TOKEN[0]
    expect(actual["sub"]).to eq(expected["sub"])
    expect(actual["iat"]).to eq(expected["iat"])
    expect(actual["jti"]).to eq(expected["jti"])
    expect(actual["iss"]).to eq(expected["iss"])
    expect(actual["exp"]).to eq(expected["exp"])
    expect(actual["mqtt"]).to eq(expected["mqtt"])
    expect(actual["bot"]).to eq(expected["bot"])
  end

  it 'issues a token to a user' do
    token = SessionToken.issue_to(user, iat: 000,
                                exp: 456,
                                iss: "//lycos.com:9867",
                                fbos_version: Gem::Version.new("9.9.9"))
    expect(token.unencoded[:beta_os_update_server]).to be_kind_of(String)
  end

  it 'conditionally sets `os_update_server`' do
    test_case = -> (ver) do
      SessionToken
        .issue_to(user, fbos_version: Gem::Version.new(ver))
        .unencoded[:os_update_server]
    end

    expect(test_case["0.0.0"]).to eq(CalculateUpgrade::OLD_OS_URL)
    expect(test_case["5.0.5"]).to eq(CalculateUpgrade::OLD_OS_URL)
    expect(test_case["5.0.6"]).to eq(CalculateUpgrade::OLD_OS_URL)
    expect(test_case["5.0.8"]).to eq(CalculateUpgrade::MID_OS_URL)
    expect(test_case["5.0.9"]).to eq(CalculateUpgrade::MID_OS_URL)
    expect(test_case["6.0.1"]).to eq(CalculateUpgrade::OS_RELEASE)
    expect(test_case["999.999.999"])
      .to eq(CalculateUpgrade::OS_RELEASE)
    expect(test_case["0.0.0"]).to eq(CalculateUpgrade::OLD_OS_URL)
    expect(test_case[CalculateUpgrade::NOT_FBOS]).to eq(CalculateUpgrade::OS_RELEASE)
  end

  it "doesn't honor expired tokens" do
    user.update_attributes!(confirmed_at: Time.now)
    token  = SessionToken.issue_to(user, iat: 000,
                                         exp: 1,
                                         iss: "//lycos.com:9867",
                                         fbos_version: Gem::Version.new("9.9.9"))
    result = Auth::FromJWT.run(jwt: token.encoded)
    expect(result.success?).to be(false)
    expect(result.errors.values.first.message)
      .to eq(Auth::ReloadToken::BAD_SUB)
  end

  unless ENV["NO_EMAILS"]
    it "doesn't mint tokens for unverified users" do
      user.update_attributes!(confirmed_at: nil)
      expect {
        SessionToken.issue_to(user, iat: 000,
                                    exp: 1,
                                    iss: "//lycos.com:9867",
                                    fbos_version: Gem::Version.new("9.9.9"))
      }.to raise_error(Errors::Forbidden)
    end
  else
    puts "Skipping a test because NO_EMAILS was enabled."
  end
end
