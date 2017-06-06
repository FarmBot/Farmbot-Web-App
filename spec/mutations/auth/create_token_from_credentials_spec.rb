require 'spec_helper'

describe Auth::FromJWT do
  let(:user)  { FactoryGirl.create(:user) }

  it 'gets user from jwt' do
    results = Auth::CreateTokenFromCredentials.run(credentials: "FOO" )
    expect(results.success?).to eq(false)
    expect(results.errors.message_list)
      .to include(Auth::CreateTokenFromCredentials::BAD_KEY)
  end
end
