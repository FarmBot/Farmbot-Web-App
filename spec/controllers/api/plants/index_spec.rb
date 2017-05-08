require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }

    it 'lists all tools' do
      3.times do |num|
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
      expect(json.first[:id]).to eq(tools.first.id)
    end
  end
end
