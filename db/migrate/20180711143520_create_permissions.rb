class CreatePermissions < ActiveRecord::Migration[5.2]
  def change
    create_table :permissions do |t|
      t.timestamps
      t.string :name, limit: 16
    end
    create_join_table :devices, :permissions do |t|
      t.index [:device_id,     :permission_id]
      t.index [:permission_id, :device_id]
    end
  end
end
