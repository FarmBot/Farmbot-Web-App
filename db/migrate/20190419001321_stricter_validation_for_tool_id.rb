class StricterValidationForToolId < ActiveRecord::Migration[5.2]
  def change
    safety_assured do
      add_index :points, [:device_id, :tool_id], unique: true
    end
  end
end
