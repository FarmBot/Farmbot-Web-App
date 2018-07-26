class IncreaseCommentLength < ActiveRecord::Migration[5.2]
  safety_assured
  def up
    change_column :primary_nodes, :comment, :string, limit: 240
  end

  def down
    change_column :primary_nodes, :comment, :string, limit: 80
  end
end
