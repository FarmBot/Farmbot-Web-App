class RemoveModeFromPeripherals < ActiveRecord::Migration[5.1]
  def change
    remove_column :peripherals, :mode, :integer
  end
end
