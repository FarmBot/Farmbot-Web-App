class AddPinReportPinNrToFirmwareConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :firmware_configs, :pin_report_1_pin_nr, :integer, default: 0
    add_column :firmware_configs, :pin_report_2_pin_nr, :integer, default: 0
  end
end
