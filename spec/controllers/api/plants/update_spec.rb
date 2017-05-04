require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let(:plant) { FactoryGirl.create(:plant_point, device: user.device).pointer }

    it 'updates a plant' do
      sign_in user
      p = { id: plant.id,
            x: 23,
            y: 45,
            name: "My Lettuce",
            openfarm_slug: "limestone-lettuce"
           }
      patch :update, params: p
      expect(response.status).to eq(200)
      plant.reload
      expect(plant.point.x).to eq(p[:x])
      expect(plant.point.y).to eq(p[:y])
      expect(plant.point.name).to eq(p[:name])
      expect(plant.openfarm_slug).to eq(p[:openfarm_slug])
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end
  end
end
