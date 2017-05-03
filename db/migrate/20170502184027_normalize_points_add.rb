class NormalizePointsAdd < ActiveRecord::Migration[5.0]
  def change
    change_column :points, :x,      :float,  null: false
    change_column :points, :y,      :float,  null: false
    change_column :points, :z,      :float,  null: false, default: 0
    change_column :points, :radius, :float,  null: false, default: 50
    add_reference :points, :pointable, index: true, polymorphic: true
    add_reference :tool_slots,      :point,  index: true
    add_reference :tool_slots,      :device, index: true
    add_reference :plants,          :point,  index: true
  end
end
