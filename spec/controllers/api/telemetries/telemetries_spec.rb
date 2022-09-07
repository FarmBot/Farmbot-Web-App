require "spec_helper"

describe Api::TelemetriesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let!(:telemetry) { FactoryBot.create_list(:telemetry, 5, device: user.device) }

  describe "#index" do
    it "lists last x telemetry" do
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.first[:id]).to eq(telemetry.last.id)
      expect(json.last[:target]).to eq(telemetry.first.target)
    end
  end

  describe "#create" do
    it "creates one telemetry" do
      sign_in user
      before_count = Telemetry.count
      body = {
        soc_temp: 100,
        throttled: "0x0",
        wifi_level_percent: 80,
        uptime: 12345,
        memory_usage: 100,
        disk_usage: 1,
        cpu_usage: 1,
        target: "rpi",
        fbos_version: "0.0.0",
        firmware_hardware: "arduino",
      }
      post :create, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(Telemetry.count).to be > before_count
      body.keys.map do |key|
        actual = json[key]
        expected = body[key]

        expect(actual).to eq(expected)
      end
    end

    it "runs compaction when the telemetry piles up" do
      Telemetry.destroy_all
      310.times { Telemetry.create!(device: user.device) }
      sign_in user
      get :index, params: { format: :json }
      expect(response.status).to eq(200)
      expect(json.length).to eq(300)
    end

    it "deletes ALL telemetry" do
      sign_in user
      before = user.device.telemetries.count
      delete :destroy, params: { id: "all" }
      expect(response.status).to eq(200)
      expect(user.device.reload.telemetries.count).to be < before
      expect(user.device.telemetries.count).to eq(0)
    end

    it "deletes specific telemetry" do
      sign_in user
      before = user.device.telemetries.count
      delete :destroy, params: { id: telemetry.first.id }
      expect(response.status).to eq(200)
      expect(user.device.reload.telemetries.count).to be < before
      expect(user.device.telemetries.count).to eq(before - 1)
    end
  end
end
