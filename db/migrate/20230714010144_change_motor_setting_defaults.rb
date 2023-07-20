class ChangeMotorSettingDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :disable_emergency_unlock_confirmation, true)

    change_column_default(:firmware_configs, :movement_motor_current_x, 1823)
    change_column_default(:firmware_configs, :movement_motor_current_y, 1823)
    change_column_default(:firmware_configs, :movement_motor_current_z, 1823)
  end
end
