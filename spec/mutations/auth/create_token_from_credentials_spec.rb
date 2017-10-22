require 'spec_helper'

describe Auth::FromJWT do
  let(:user)  { FactoryBot.create(:user) }


  def fake_credentials(email, password)
    # Input -> JSONify -> encrypt -> Base64ify
    secret = { email: email, password: password }.to_json
    ct     = KeyGen.current.public_encrypt(secret)
    return Base64.encode64(ct)
  end

  it 'rejects bad credentials' do
    results = Auth::CreateTokenFromCredentials.run(credentials: "FOO" )
    expect(results.success?).to eq(false)
    expect(results.errors.message_list)
      .to include(Auth::CreateTokenFromCredentials::BAD_KEY)
  end

  it 'accepts good credentials' do
    pw      = "password123"
    user    = FactoryBot.create(:user, password: pw)
    email   = user.email
    creds   = fake_credentials(email, pw)
    results = Auth::CreateTokenFromCredentials.run!(credentials: creds)
    expect(results[:token]).to be_kind_of(SessionToken)
    expect(results[:user]).to eq(user)
  end
end
