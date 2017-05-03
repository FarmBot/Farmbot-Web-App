class NormalizePoints < ActiveRecord::Migration[5.0]
  def change
    change_column :points, :x,      :float,  null:  false
    change_column :points, :y,      :float,  null:  false
    change_column :points, :z,      :float,  null:  false, default: 0
    change_column :points, :radius, :float,  null:  false, default: 50
    add_reference :tool_slots,      :device, index: true
    create_table :generic_pointers do |t|
      t.references :device, null: false
    end
    add_reference :points,
                  :pointer,
                  index: true,
                  polymorphic: true,
                  null: false
    ToolSlot.includes(:tool_bay).find_each do |ts|
      Point.create!(x:         ts.x,
                    y:         ts.y,
                    z:         ts.z,
                    pointer:   ts,
                    device_id: ts.tool_bay.device_id,
                    meta:      {})
    end

    Plant.find_each do |pl|
      Point.create!(x:         pl.x,
                    y:         pl.y,
                    z:         pl.z,
                    pointer:   ts,
                    device_id: pl.device_id,
                    meta:      {})
    end
    [:x,:y].each do |coord|
     remove_column :plants,     coord, :float
     remove_column :tool_slots, coord, :float
    end
    remove_column :tool_slots, :z, :float
    remove_column :tool_slots, :tool_bay_id, :float
    remove_column :plants,     :radius, :float
    drop_table    :tool_bays
  end
end
