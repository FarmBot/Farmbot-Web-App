class AddZHeightsToFbosConfig < ActiveRecord::Migration[6.0]
  def change
    add_column :fbos_configs, :safe_height, :integer, default: 0
    add_column :fbos_configs, :soil_height, :integer, default: 0
  end
end
