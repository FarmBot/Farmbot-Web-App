require 'spec_helper'

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user)   { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe '#sync' do
    EDGE_CASES = [:devices, # Singular resources
                  :fbos_configs,
                  :firmware_configs,]
    FORMAT     = "%Y-%m-%d %H:%M:%S.%6N"
    it 'provides timestamps of updates, plus current time' do
      sign_in user

      FactoryBot.create(:diagnostic_dump,       device: device)
      FactoryBot.create(:farm_event,            device: device)
      FactoryBot.create(:farmware_env,          device: device)
      FactoryBot.create(:farmware_installation, device: device)
      FactoryBot.create(:generic_pointer,       device: device)
      FactoryBot.create(:peripheral,            device: device)
      FactoryBot.create(:pin_binding,           device: device)
      FactoryBot.create(:plant,                 device: device)
      FactoryBot.create(:regimen,               device: device)
      FactoryBot.create(:sensor_reading,        device: device)
      FactoryBot.create(:sensor,                device: device)
      FactoryBot.create(:tool_slot,             device: device)
      FactoryBot.create(:tool,                  device: device)
      FakeSequence.create(device: device)

      get :sync, params: {}, session: { format: :json }
      expect(response.status).to eq(200)
      expect(Time.now - Time.parse(json[:now])).to be < 150
      pair = json[:devices].first
      expect(pair.first).to eq(device.id)
      real_time = device.updated_at.strftime(FORMAT)
      expect(pair.last).to include(real_time)
      expect(pair.last.first(8)).to eq(device.updated_at.as_json.first(8))
      json.keys.without(:now).without(*EDGE_CASES).map do |key|
        array = json[key]
        expect(array).to be_kind_of(Array)
        sample = array.sample
        raise "Needs #{key} entry" unless sample
        expect(sample).to be_kind_of(Array)
        expect(sample.first).to be_kind_of(Integer)
        expect(sample.last).to be_kind_of(String)
        obj = device.send(key)

        if obj.is_a?(ApplicationRecord)
          expect(obj.id).to                 eq(sample.first)
          expect(obj.updated_at.as_json).to eq(sample.last)
        else
          expected = obj.pluck(:id, :updated_at)
          json[key].each_with_index do |item, index|
            comparison = expected[index]
            expect(item.first).to eq(comparison.first)
            expect(Time.parse(item.last)).to eq(comparison.last.to_time)
          end
        end
      end
    end
  end
end
