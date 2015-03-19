require 'spec_helper'

describe 'Device Management' do
  include Capybara::Angular::DSL

  let(:user) { FactoryGirl.create(:user) }

  it 'adds a device', js: true do
    pending 'Not there yet.'
    visit 'dashboard#/devices'
    fill_in 'FarmBot Name *', with: 'LOL!@'
  end
end
