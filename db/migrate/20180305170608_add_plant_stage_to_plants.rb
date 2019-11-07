class AddPlantStageToPlants < ActiveRecord::Migration[5.1]

  def change
    add_column :plants, :plant_stage, :string, limit: 10, default: "planned",
                presence: true
  end
end
