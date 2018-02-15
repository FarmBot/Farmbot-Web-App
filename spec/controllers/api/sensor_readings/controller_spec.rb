require 'spec_helper'

describe Api::SensorReadingsController do
  include Devise::Test::ControllerHelpers

  describe 'CRUD actions' do
    let(:user)     { FactoryBot.create(:user) }
    let (:reading) { FactoryBot.create(:sensor_reading, device: user.device) }

    it 'makes a sensor reading' do
      sign_in user
      before = SensorReading.count
      post :create,
        body: { pin: 13, value: 128, x: nil, y: 1, z: 2 }.to_json,
        params: { format: :json }

      expect(response.status).to eq(200)
      expect(json[:id]).to        be_kind_of(Integer)
      expect(json[:value]).to     eq(128)
      expect(json[:device_id]).to eq(nil) # Use the serializer, not as_json.
      expect(json[:x]).to         eq(nil)
      expect(json[:y]).to         eq(1)
      expect(json[:z]).to         eq(2)
      expect(json[:pin]).to       eq(13)
      expect(before < SensorReading.count).to be_truthy
    end

    it 'requires logged in user' do
      post :create, params: {}
      expect(response.status).to eq(401)
    end
  end
end
