class AprilParameterAdditions < ActiveRecord::Migration[5.1]
  NEW_STUFF = { movement_invert_2_endpoints_x: 0,
                movement_invert_2_endpoints_y: 0,
                movement_invert_2_endpoints_z: 0 }

  def change
    NEW_STUFF.map do |(name, default)|
      add_column :firmware_configs, name, :integer, default: default
    end
  end
end
