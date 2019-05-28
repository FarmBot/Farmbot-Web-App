require 'spec_helper'

describe Api::FirmwareConfigsController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe '#show' do
    it 'handles requests' do
      sign_in user
      device.firmware_config.destroy! # Let's test defaults.
      get :show, format: :json
      expect(response.status).to eq(200)
      { encoder_enabled_x:                 0,
        encoder_enabled_y:                 0,
        encoder_enabled_z:                 0,
        encoder_invert_x:                  0,
        encoder_invert_y:                  0,
        encoder_invert_z:                  0,
        encoder_missed_steps_decay_x:      5,
        encoder_missed_steps_decay_y:      5,
        encoder_missed_steps_decay_z:      5,
        encoder_missed_steps_max_x:        5,
        encoder_missed_steps_max_y:        5,
        encoder_missed_steps_max_z:        5,
        encoder_scaling_x:                 5556,
        encoder_scaling_y:                 5556,
        encoder_scaling_z:                 5556,
        encoder_type_x:                    0,
        encoder_type_y:                    0,
        encoder_type_z:                    0,
        encoder_use_for_pos_x:             0,
        encoder_use_for_pos_y:             0,
        encoder_use_for_pos_z:             0,
        movement_axis_nr_steps_x:          0,
        movement_axis_nr_steps_y:          0,
        movement_axis_nr_steps_z:          0,
        movement_enable_endpoints_x:       0,
        movement_enable_endpoints_y:       0,
        movement_enable_endpoints_z:       0,
        movement_home_at_boot_x:           0,
        movement_home_at_boot_y:           0,
        movement_home_at_boot_z:           0,
        movement_home_spd_x:               50,
        movement_home_spd_y:               50,
        movement_home_spd_z:               50,
        movement_home_up_x:                0,
        movement_home_up_y:                0,
        movement_home_up_z:                1,
        movement_invert_endpoints_x:       0,
        movement_invert_endpoints_y:       0,
        movement_invert_endpoints_z:       0,
        movement_invert_motor_x:           0,
        movement_invert_motor_y:           0,
        movement_invert_motor_z:           0,
        movement_keep_active_x:            1,
        movement_keep_active_y:            1,
        movement_keep_active_z:            1,
        movement_max_spd_x:                400,
        movement_max_spd_y:                400,
        movement_max_spd_z:                400,
        movement_min_spd_x:                50,
        movement_min_spd_y:                50,
        movement_min_spd_z:                50,
        movement_secondary_motor_invert_x: 1,
        movement_secondary_motor_x:        1,
        movement_step_per_mm_x:            5,
        movement_step_per_mm_y:            5,
        movement_step_per_mm_z:            25,
        movement_steps_acc_dec_x:          300,
        movement_steps_acc_dec_y:          300,
        movement_steps_acc_dec_z:          300,
        movement_stop_at_home_x:           0,
        movement_stop_at_home_y:           0,
        movement_stop_at_home_z:           0,
        movement_stop_at_max_x:            0,
        movement_stop_at_max_y:            0,
        movement_stop_at_max_z:            0,
        movement_timeout_x:                120,
        movement_timeout_y:                120,
        movement_timeout_z:                120,
        param_config_ok:                   0,
        param_e_stop_on_mov_err:           0,
        param_mov_nr_retry:                3,
        param_test:                        0,
        param_use_eeprom:                  1,
        param_version:                     1,
        pin_guard_1_active_state:          1,
        pin_guard_1_pin_nr:                0,
        pin_guard_1_time_out:              60,
        pin_guard_2_active_state:          1,
        pin_guard_2_pin_nr:                0,
        pin_guard_2_time_out:              60,
        pin_guard_3_active_state:          1,
        pin_guard_3_pin_nr:                0,
        pin_guard_3_time_out:              60,
        pin_guard_4_active_state:          1,
        pin_guard_4_pin_nr:                0,
        pin_guard_4_time_out:              60,
        pin_guard_5_active_state:          1,
        pin_guard_5_pin_nr:                0,
        pin_guard_5_time_out:              60,
      }.to_a.map { |key, value| expect(json[key]).to eq(value) }

      { created_at: String, updated_at: String }
        .to_a.map { |key, value| expect(json[key]).to be_kind_of(value) }
    end
  end

  describe '#update' do
    it 'handles update requests' do
      sign_in user
      body = { pin_guard_5_time_out: 23 }
      body.to_a.map { |key, val| expect(device.firmware_config.send(key)).not_to eq(val) }
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      device.reload
      body.to_a.map do |key, val|
        expect(device.firmware_config.send(key)).to eq(val)
        expect(json[key]).to eq(val)
      end
    end

    it 'disallows mass assignment attacks against device_id' do
      sign_in user
      body = { device_id: 99 }
      conf = device.firmware_config
      old_device_id = conf.device_id
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(conf.reload.device_id).to eq(old_device_id)
    end
  end

  describe '#delete' do
    it 'resets everything to the defaults' do
      sign_in user
      old_conf = device.firmware_config
      old_conf.update_attributes(pin_guard_5_pin_nr: 23)
      delete :destroy, params: {}
      expect(response.status).to eq(200)
      new_conf = device.reload.firmware_config
      expect(new_conf.pin_guard_5_pin_nr).to_not eq(23)
    end
  end
end
