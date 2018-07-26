class AddDefaultToModeOnPeripherals < ActiveRecord::Migration[5.1]
  safety_assured
  def up
    change_column :peripherals, :mode, :integer, default: 0
    Peripheral.where(mode: nil).update_all(mode: 0)
  end

  def down
    change_column :peripherals, :mode, :integer, default: nil
  end
end
