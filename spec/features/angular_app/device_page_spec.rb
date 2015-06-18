require 'spec_helper'

describe 'Device Management' do
  include Capybara::Angular::DSL

  let(:user) { FactoryGirl.create(:user) }

  # it 'adds a device', js: true do
  #   pending
  #   visit 'dashboard#/devices'
  #   fill_in 'botname', with: 'LOL!@'
  # end
end
