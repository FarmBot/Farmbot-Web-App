require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }

    it 'creates a point' do
      sign_in user
      body = { x: 1,
               y: 2,
               z: 3,
               radius: 3,
               meta: { foo: "BAR" } }
      post :create, body: body.to_json,
                    params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:x]).to eq(body[:x])
      expect(json[:y]).to eq(body[:y])
      expect(json[:z]).to eq(body[:z])
      expect(json[:radius]).to eq(body[:radius])
      expect(json[:meta][:foo]).to eq(body[:meta][:foo])
      expect(Point.last.device).to eq(device)
    end
  end
end
