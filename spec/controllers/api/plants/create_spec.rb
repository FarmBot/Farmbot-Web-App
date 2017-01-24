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
            img_url: "/lettuce.png",
            icon_url: "/tiny-lettuce.png",
            openfarm_slug: "limestone-lettuce" }
      post :create, params: p
      expect(response.status).to eq(200)
      plant = Plant.last
      expect(plant.x).to eq(p[:x])
      expect(plant.y).to eq(p[:y])
      expect(plant.name).to eq(p[:name])
      expect(plant.img_url).to eq(p[:img_url])
      expect(plant.icon_url).to eq(p[:icon_url])
      expect(plant.openfarm_slug).to eq(p[:openfarm_slug])
      expect(plant.created_at).to be_truthy
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end
  end
end
