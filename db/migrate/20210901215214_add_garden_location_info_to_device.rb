class AddGardenLocationInfoToDevice < ActiveRecord::Migration[6.1]
  def change
    add_column :devices, :lat, :decimal
    add_column :devices, :lng, :decimal
    add_column :devices, :indoor, :boolean, default: false
  end
end
