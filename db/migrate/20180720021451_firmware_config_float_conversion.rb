class FirmwareConfigFloatConversion < ActiveRecord::Migration[5.2]
  def up
    change_column :firmware_configs, :movement_step_per_mm_x, :float
    change_column :firmware_configs, :movement_step_per_mm_y, :float
    change_column :firmware_configs, :movement_step_per_mm_z, :float
  end

  def down
    change_column :firmware_configs, :movement_step_per_mm_x, :integer
    change_column :firmware_configs, :movement_step_per_mm_y, :integer
    change_column :firmware_configs, :movement_step_per_mm_z, :integer
  end
end
