class MakeDefaulDeviceNameFarmbot < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    change_column_default(:devices, :name, "Farmbot")
  end
end
