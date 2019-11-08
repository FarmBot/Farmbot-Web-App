class FixPulloutDirection < ActiveRecord::Migration[5.1]

  def change
    remove_column :tools,      :pullout_direction, :integer, default: 0
    add_column    :tool_slots, :pullout_direction, :integer, default: 0
  end
end
