class AddMissingIndexPointToolId < ActiveRecord::Migration[5.1]
  def change
    add_index :points, :tool_id
  end
end
