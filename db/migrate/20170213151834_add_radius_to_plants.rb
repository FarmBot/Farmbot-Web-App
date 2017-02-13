class AddRadiusToPlants < ActiveRecord::Migration[5.0]
  def change
    add_column :plants, :radius, :float, default: 50
    remove_column :farm_events, :repeats, :boolean
  end
end
