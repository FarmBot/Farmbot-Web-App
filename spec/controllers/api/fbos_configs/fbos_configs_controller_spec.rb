require 'spec_helper'

describe Api::FbosConfigsController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe '#show' do
    it 'handles requests' do
      sign_in user
      device.fbos_config.destroy! # Let's test defaults.
      get :show, format: :json
      expect(response.status).to be(200)
      {
        device_id:               device.id,
        auto_sync:               false,
        beta_opt_in:             false,
        disable_factory_reset:   false,
        firmware_input_log:      false,
        firmware_output_log:     false,
        sequence_body_log:       false,
        sequence_complete_log:   false,
        sequence_init_log:       false,
        arduino_debug_messages:  -99,
        network_not_found_timer: nil,
        os_auto_update:          0,
        firmware_hardware:       "arduino"
      }.to_a.map { |key, value| expect(json[key]).to eq(value) }

      { created_at: String, updated_at: String }
        .to_a.map { |key, value| expect(json[key]).to be_kind_of(value) }
    end
  end

  describe '#update' do
    it 'handles update requests' do
      sign_in user
      body = { beta_opt_in: true, disable_factory_reset: true }
      body.to_a.map { |key, val| expect(device.fbos_config.send(key)).not_to eq(val) }
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      device.reload
      body.to_a.map do |key, val|
        expect(device.fbos_config.send(key)).to eq(val)
        expect(json[key]).to eq(val)
      end
    end

    it 'disallows mass assignment attacks against device_id'
  end

  describe '#delete' do
    it 'resets everything to the defaults'
  end
end
