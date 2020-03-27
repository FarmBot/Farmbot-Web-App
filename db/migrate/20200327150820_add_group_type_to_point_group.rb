class AddGroupTypeToPointGroup < ActiveRecord::Migration[6.0]
  def change
    add_column :point_groups, :group_type, :text, limit: 50
  end
end
