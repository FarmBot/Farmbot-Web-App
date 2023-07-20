class ChangeLandingPageAndEncoderDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :landing_page, from: "controls", to: "plants")

    change_column_default(:firmware_configs, :encoder_enabled_x, from: 0, to: 1)
    change_column_default(:firmware_configs, :encoder_enabled_y, from: 0, to: 1)
    change_column_default(:firmware_configs, :encoder_enabled_z, from: 0, to: 1)
  end
end
