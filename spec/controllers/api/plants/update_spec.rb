require 'spec_helper'

describe Api::PlantsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let(:plant) { FactoryGirl.create(:plant, device: user.device) }

    it 'updates a plant' do
      sign_in user
      RIGHT_NOW = "2017-01-24T07:40:26.965-06:00"
      p = { id: plant.id,
            x: 23,
            y: 45,
            name: "My Lettuce",
            img_url: "/lettuce.png",
            openfarm_slug: "limestone-lettuce",
            created_at: RIGHT_NOW }
      patch :update, params: p
      expect(response.status).to eq(200)
      plant.reload
      expect(plant.x).to eq(p[:x])
      expect(plant.y).to eq(p[:y])
      expect(plant.name).to eq(p[:name])
      expect(plant.img_url).to eq(p[:img_url])
      expect(plant.openfarm_slug).to eq(p[:openfarm_slug])
      expect(plant.created_at).to eq(p[:created_at])
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end
  end
end
