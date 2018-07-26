class AddMoreMoreLogIndexes < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_index :logs, [:device_id, :created_at]
  end
end
