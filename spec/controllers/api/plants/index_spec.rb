require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }

    it 'lists all plants' do
      Point.destroy_all
      plants = 3.times do |num|
        Point.create!(x:       num,
                      y:       num,
                      z:       num,
                      radius:  50,
                      name:    "Cabbage #{num}",
                      device:  user.device,
                      pointer: Plant.new(openfarm_slug: "cabbage"))
      end
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
    end
  end
end
