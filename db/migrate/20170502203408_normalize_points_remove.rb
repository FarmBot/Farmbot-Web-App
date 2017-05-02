class NormalizePointsRemove < ActiveRecord::Migration[5.0]
  def change
    [:x,:y].each do |coord|
     remove_column :plants, coord
     remove_column :tool_slots, coord
    end
    remove_column :tool_slots, :z
    remove_column :plants, :radius
    change_column :plants, :point_id, :integer, null: false
    change_column :tool_slots, :point_id, :integer, null: false
    drop_table    :tool_bays
  end
end
