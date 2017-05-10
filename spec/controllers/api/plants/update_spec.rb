require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let(:plant) { FactoryGirl.create(:plant_point, device: user.device).pointer }

  end
end
