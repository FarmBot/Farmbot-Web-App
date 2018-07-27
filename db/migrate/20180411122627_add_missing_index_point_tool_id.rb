class AddMissingIndexPointToolId < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_index :points, :tool_id
  end
end
