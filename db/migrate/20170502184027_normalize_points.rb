class NormalizePoints < ActiveRecord::Migration[5.0]
  def change
    # UPDATES TO TABLES ===================================================
    change_column :points,   :x,         :float,  null:  false
    change_column :points,   :y,         :float,  null:  false
    change_column :points,   :z,         :float,  null:  false, default: 0
    change_column :points,   :radius,    :float,  null:  false, default: 50
    change_column :points,   :device_id, :integer,null:  false
    change_column :sequences, :name,      :string, null: false
    change_column_null :sequence_dependencies, :sequence_id, false
    add_foreign_key :sequence_dependencies,
                    :sequences,
                    column: :sequence_id
    change_column :plants,
                  :openfarm_slug,
                  :string,
                  null:  false,
                  default: 50
    create_table(:generic_pointers) { |_| /# Empty table..#/ }
    add_column    :points, :name, :string, null: false, default: "untitled"
    add_reference :points,
                  :pointer,
                  index: true,
                  polymorphic: true
    # MANUAL MIGRATIONS ===================================================
    ToolSlot.includes(:tool_bay).find_each do |ts|
      Point.create!(x:         ts[:x],
                    y:         ts[:y],
                    z:         ts[:z],
                    name:      ts[:name],
                    device_id: ts.tool_bay[:device_id],
                    pointer:   ts,
                    meta:      {})
    end

    Plant.find_each do |pl|
      Point.create!(x:         pl[:x],
                    y:         pl[:y],
                    z:         pl[:z] || 0,
                    name:      pl[:name],
                    device_id: pl[:device_id],
                    pointer:   pl,
                    meta:      {})
    end

    # DESTRUCTIVE ACTIONS =================================================
    [:x,:y].each do |coord|
      remove_column :plants,     coord, :float
      remove_column :tool_slots, coord, :float
    end
    remove_column :plants,     :device_id,   :integer
    remove_column :plants,     :name,        :string
    remove_column :plants,     :radius,      :float
    remove_column :tool_slots, :name,        :string
    remove_column :tool_slots, :tool_bay_id, :float
    remove_column :tool_slots, :z, :float
    drop_table    :tool_bays
  end
end
