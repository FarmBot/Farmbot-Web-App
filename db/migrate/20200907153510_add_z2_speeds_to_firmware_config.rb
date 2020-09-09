class AddZ2SpeedsToFirmwareConfig < ActiveRecord::Migration[6.0]
  def change
    add_column :firmware_configs, :movement_min_spd_z2, :integer, default: 50
    add_column :firmware_configs, :movement_max_spd_z2, :integer, default: 400
    add_column :firmware_configs, :movement_steps_acc_dec_z2, :integer, default: 300
  end
end
