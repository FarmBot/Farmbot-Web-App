class RemoveModeFromPeripherals < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    remove_column :peripherals, :mode, :integer
  end
end
