class AddUpdateChannelToFbosConfigs < ActiveRecord::Migration[5.2]
  safety_assured # This table is small enough.
  def change
    add_column :fbos_configs,
               :update_channel,
               :string,
               default: "stable",
               limit:   7
  end
end
