class ChangeFirmwareHardwareDefaultValue < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:fbos_configs, :firmware_hardware, from: "arduino", to: "none")
  end
end
