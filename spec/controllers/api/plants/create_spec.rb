require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
  end
end
