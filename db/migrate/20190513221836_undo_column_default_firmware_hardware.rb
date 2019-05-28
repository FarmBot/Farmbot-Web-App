class UndoColumnDefaultFirmwareHardware < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:fbos_configs, :firmware_hardware, from: "none", to: nil)
  end
end
