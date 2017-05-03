class NormalizePointsRemove < ActiveRecord::Migration[5.0]
  def change
    [:x,:y].each do |coord|
     remove_column :plants,     coord, :float
     remove_column :tool_slots, coord, :float
    end
    remove_column :tool_slots, :z, :float
    remove_column :tool_slots, :tool_bay_id, :float
    remove_column :plants,     :radius, :float
    change_column :tool_slots, :point_id, :integer, null: false
    drop_table    :tool_bays
  end
end
