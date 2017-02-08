require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user) { FactoryGirl.create(:user, device: device) }
    let!(:point) { FactoryGirl.create(:point, device: device) }

    it 'updates a point' do
      sign_in user
      body = { x:      99,
               y:      87,
               z:      33,
               radius: 55,
               meta: { foo: "BAR" } }
      put :update, body: body.to_json,
                   params: { format: :json, id: point.id }
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
