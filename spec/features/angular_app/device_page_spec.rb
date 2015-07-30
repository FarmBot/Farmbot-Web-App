require 'spec_helper'

describe 'Device Management' do
  include Capybara::Angular::DSL

  let(:user) { FactoryGirl.create(:user) }
end
