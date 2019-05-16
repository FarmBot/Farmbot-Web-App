require "spec_helper"

describe Api::WebAppConfigsController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#show" do
    it "handles requests" do
      sign_in user
      device.web_app_config.destroy! # Let's test defaults.
      get :show, format: :json
      expect(response.status).to eq(200)
      {
        confirm_step_deletion: false,
        disable_animations: false,
        disable_i18n: false,
        display_trail: false,
        dynamic_map: false,
        encoder_figure: false,
        hide_webcam_widget: false,
        legend_menu_open: false,
        map_xl: false,
        raw_encoders: false,
        scaled_encoders: false,
        show_spread: true,
        show_farmbot: true,
        show_plants: true,
        show_points: true,
        x_axis_inverted: false,
        y_axis_inverted: false,
        z_axis_inverted: false,
        bot_origin_quadrant: 2,
        zoom_level: 1,
        success_log: 1,
        busy_log: 1,
        warn_log: 1,
        error_log: 1,
        info_log: 1,
        fun_log: 1,
        debug_log: 1,
      }.to_a.map { |key, value| expect(json[key]).to eq(value) }

      { created_at: String, updated_at: String }
        .to_a.map { |key, value| expect(json[key]).to be_kind_of(value) }
    end
  end

  describe "#update" do
    it "handles update requests" do
      sign_in user
      body = { info_log: 23, bot_origin_quadrant: -1 }
      calls = { self_id: user.device.web_app_config.id, device_id: user.device_id }
      body.to_a.map { |key, val| expect(device.web_app_config.send(key)).not_to eq(val) }
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      device.reload
      body.to_a.map do |key, val|
        expect(device.web_app_config.send(key)).to eq(val)
        expect(json[key]).to eq(val)
      end
    end

    it "does not trigger Rollbar for `null` values" do
      sign_in user
      body = { info_log: 23, bot_origin_quadrant: -1, internal_use: nil.to_json }
      expect(Rollbar).not_to receive(:error)
      body.to_a.map { |key, val| expect(device.web_app_config.send(key)).not_to eq(val) }
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      device.reload
      body.to_a.map do |key, val|
        expect(device.web_app_config.send(key)).to eq(val)
        expect(json[key]).to eq(val)
      end
    end

    it "disallows mass assignment attacks against device_id" do
      sign_in user
      body = { device_id: 99 }
      conf = device.web_app_config
      old_device_id = conf.device_id
      put :update, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(conf.reload.device_id).to eq(old_device_id)
    end
  end

  describe "#delete" do
    it "resets everything to the defaults" do
      sign_in user
      old_conf = device.web_app_config
      old_conf.update_attributes(zoom_level: 23)
      delete :destroy, params: {}
      expect(response.status).to eq(200)
      new_conf = device.reload.web_app_config
      expect(new_conf.zoom_level).to_not eq(23)
    end
  end
end
