require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }

    it 'creates a plant' do
      sign_in user
      p = { x: 23,
            y: 45,
            name: "My Lettuce",
            openfarm_slug: "limestone-lettuce" }
      post :create, params: p
      expect(response.status).to eq(200)
      plant = Plant.last
      expect(plant.point.x).to eq(p[:x])
      expect(plant.point.y).to eq(p[:y])
      expect(plant.point.name).to eq(p[:name])
      expect(plant.openfarm_slug).to eq(p[:openfarm_slug])
      expect(plant.created_at).to be_truthy
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end
  end
end
