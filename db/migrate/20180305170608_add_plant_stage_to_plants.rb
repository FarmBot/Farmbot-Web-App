class AddPlantStageToPlants < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :plants, :plant_stage, :string, limit: 10, default: "planned",
                presence: true
  end
end
