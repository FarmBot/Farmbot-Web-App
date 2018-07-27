class AddPlantedAtToPlants < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :plants, :planted_at, :datetime, default: nil
  end
end
