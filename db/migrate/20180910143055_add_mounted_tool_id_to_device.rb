class AddMountedToolIdToDevice < ActiveRecord::Migration[5.2]
  def change
    add_reference :devices,
                  :mounted_tool,
                  null: true,
                  foreign_key: { to_table: :tools }
  end
end
