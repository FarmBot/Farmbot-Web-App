class ChangeDefaultRadius < ActiveRecord::Migration[5.1]
  def change
    change_column :points, :radius, :float, default: 25
  end
end
