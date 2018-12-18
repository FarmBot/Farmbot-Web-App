require 'spec_helper'

describe Api::DeviceCertsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
  end
end
