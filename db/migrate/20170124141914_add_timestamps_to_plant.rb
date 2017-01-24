class AddTimestampsToPlant < ActiveRecord::Migration[5.0]
  def change
    add_column    :plants, :created_at, :datetime
    add_index     :plants, :created_at
    remove_column :plants, :planted_at, :integer
    change_column :plants, :x, :integer
    change_column :plants, :y, :integer
  end
end
