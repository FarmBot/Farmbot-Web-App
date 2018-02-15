class AddDefaultToModeOnPeripherals < ActiveRecord::Migration[5.1]
  def up
    change_column :peripherals, :mode, :integer, default: 0
  end

  def down
    change_column :peripherals, :mode, :integer, default: nil
  end
end
