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

      expect(response.status).to  eq(200)
      expect(json[:id]).to        be_kind_of(Integer)
      expect(json[:value]).to     eq(128)
      expect(json[:device_id]).to eq(nil) # Use the serializer, not as_json.
      expect(json[:x]).to         eq(nil)
      expect(json[:y]).to         eq(1)
      expect(json[:z]).to         eq(2)
      expect(json[:pin]).to       eq(13)
      expect(before < SensorReading.count).to be_truthy
    end

    it 'shows one reading' do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      get :show, params: { format: :json, id: id }
      expect(json).to be_kind_of(Hash)
      reading.reload
      [ :id, :value, :x, :y, :z, :pin ].map do |attr|
        expect(json[attr]).to eq(reading.send(attr))
      end
    end

    it 'shows all readings' do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      get :index, params: { format: :json }
      expect(json).to be_kind_of(Array)
      expect(json.length).to eq(user.device.sensor_readings.length)
      keys = json.first.keys
      expect(json.map{|x| x[:id] }).to include(id)
      expect(keys).to include(:x, :y, :z, :value, :pin)
    end

    it 'destroys a reading' do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      before = SensorReading.count
      expect(before).to eq(1)
      delete :destroy, params: { format: :json, id: id }
      expect(SensorReading.where(id: id).count).to eq(0)
      expect(before).to be > SensorReading.count
    end

    it 'requires logged in user' do
      post :create, params: {}
      expect(response.status).to eq(401)
    end
  end
end
