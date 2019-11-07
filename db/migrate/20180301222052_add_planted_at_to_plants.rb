class AddPlantedAtToPlants < ActiveRecord::Migration[5.1]

  def change
    add_column :plants, :planted_at, :datetime, default: nil
  end
end
