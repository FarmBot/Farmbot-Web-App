require 'spec_helper'
describe TokenExpiration do
  let(:regimen) { FactoryBot.create(:regimen) }

  it "Never broadcasts changes and isnt even used right now" do
    expect(TokenExpiration.new.broadcast?).to be false
  end

end
