class StricterValidationForToolId < ActiveRecord::Migration[5.2]
  def change
      add_index :points, [:device_id, :tool_id], unique: true
  end
end
