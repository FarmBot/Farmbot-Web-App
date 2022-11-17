class AddDepthToPoints < ActiveRecord::Migration[6.1]
  def up
    add_column :points, :depth, :integer, default: 0
  end

  def down
    remove_column :points, :depth
  end
end
