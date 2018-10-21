require 'spec_helper'

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user)   { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe '#sync' do
    it 'provides timestamps of updates, plus current time' do
      sign_in user

      FactoryBot.create(:diagnostic_dump,      device: device)
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
      pair = json[:device].first
      expect(pair.first).to eq(device.id)
      expect(pair.last).to eq(device.updated_at.as_json)
      expect(pair.last.first(8)).to eq(device.updated_at.as_json.first(8))
      json.keys.without(:now).without(:device).map do |key|
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
          pairs = obj
            .pluck(:id, :updated_at)
            .map{|(id, date)| [id, date.as_json]}
          expect(json[key]).to eq(pairs)
        end
      end
    end
  end
end
