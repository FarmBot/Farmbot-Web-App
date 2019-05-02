class AddGantryMountedToToolSlots < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :points, :gantry_mounted, :boolean, default: false
  end
end
