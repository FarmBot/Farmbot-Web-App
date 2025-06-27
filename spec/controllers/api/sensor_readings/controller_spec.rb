require "spec_helper"

describe Api::SensorReadingsController do
  include Devise::Test::ControllerHelpers

  describe "CRUD actions" do
    let(:user) { FactoryBot.create(:user) }
    let (:reading) { FactoryBot.create(:sensor_reading, device: user.device) }

    it "sets a default `read_at` value" do
      sign_in user
      before = SensorReading.count
      read_at = Time.now - 5.hours
      post :create,
        body: {
          pin: 13,
          value: 128,
          x: nil,
          y: 1,
          z: 2,
          mode: 1,
        }.to_json,
        params: { format: :json }

      expect(response.status).to eq(200)
      created_at_result = Time.parse(json[:created_at])
      read_at_result = Time.parse(json[:read_at])
      expect((created_at_result - read_at_result).abs).to be < 0.1
    end

    it "makes a sensor reading" do
      sign_in user
      before = SensorReading.count
      read_at = Time.now - 5.hours
      post :create,
        body: {
          pin: 13,
          value: 128,
          x: nil,
          y: 1,
          z: 2,
          mode: 1,
          read_at: read_at,
        }.to_json,
        params: { format: :json }

      expect(response.status).to eq(200)
      expect(json[:id]).to be_kind_of(Integer)
      expect(json[:created_at]).to be_kind_of(String)
      expect(json[:value]).to eq(128)
      expect(json[:device_id]).to eq(nil) # Use the serializer, not as_json.
      expect(json[:x]).to eq(nil)
      expect(json[:y]).to eq(1)
      expect(json[:z]).to eq(2)
      expect(json[:pin]).to eq(13)
      expect(json[:mode]).to eq(1)
      expect((Time.parse(json[:read_at]) - read_at).abs).to be < 0.1
      expect(before < SensorReading.count).to be_truthy
    end

    it "shows one reading" do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      get :show, params: { format: :json, id: id }
      expect(json).to be_kind_of(Hash)
      reading.reload
      [:id, :value, :x, :y, :z, :pin, :mode].map do |attr|
        expect(json[attr]).to eq(reading.send(attr))
      end
    end

    it "shows all readings" do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      get :index, params: { format: :json }
      expect(json).to be_kind_of(Array)
      expect(json.length).to eq(user.device.sensor_readings.length)
      keys = json.first.keys
      expect(json.map { |x| x[:id] }).to include(id)
      expect(keys).to include(:x, :y, :z, :value, :pin)
    end

    it "paginates sensor readings" do
      sign_in user
      SensorReading.destroy_all
      FactoryBot.create_list(:sensor_reading, 30, device: user.device)
      get :index, params: { format: :json, page: 2, per: 5 }
      expect(json.length).to eq(5)
    end

    it "destroys a reading" do
      sign_in user
      SensorReading.destroy_all
      id = reading.id
      before = SensorReading.count
      expect(before).to eq(1)
      delete :destroy, params: { format: :json, id: id }
      expect(SensorReading.where(id: id).count).to eq(0)
      expect(before).to be > SensorReading.count
    end

    it "requires logged in user" do
      post :create, body: {}.to_json
      expect(response.status).to eq(401)
    end

    it "cleans up excess sensor readings" do
      const_reassign(Device, :DEFAULT_MAX_SENSOR_READINGS, 5)
      sign_in user
      10.times do |n|
        FactoryBot.create(:sensor_reading,
                          device: user.device,
                          created_at: n.minutes.ago)
      end
      expect(user.device.sensor_readings.count).to eq(10)
      run_jobs_now do
        get :index, params: { format: :json }
      end
      expect(json.count).to eq(5)
      expect(user.device.sensor_readings.count).to eq(5)
      const_reassign(Device, :DEFAULT_MAX_SENSOR_READINGS, 2500)
      first = (json.first[:created_at])
      last = (json.last[:created_at])
      expect(first).to be > last
    end
  end
end
