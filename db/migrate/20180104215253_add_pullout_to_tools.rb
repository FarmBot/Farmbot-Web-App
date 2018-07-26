class AddPulloutToTools < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :tools, :pullout_direction, :integer, default: 0
  end
end
