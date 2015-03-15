require 'spec_helper'

describe 'Device Management' do
  let(:user) { FactoryGirl.create(:user) }

  it 'adds a device' do
    pending 'Fix these broke integration tests :('
    sign_in user
    visit 'dashboard#/devices'
  end
end
