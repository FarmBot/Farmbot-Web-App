require 'spec_helper'

describe Auth::FromJWT do
    let(:user)  { FactoryGirl.create(:user) }
    let(:token) { SessionToken.issue_to(user).encoded } 

  it 'gets user from jwt' do
    result = Auth::FromJWT.run!( jwt: token )
    expect(result).to eq(user)
  end
end