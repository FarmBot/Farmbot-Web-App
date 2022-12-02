class AddFlowRateAndGantryHeight < ActiveRecord::Migration[6.1]
  def up
    add_column :tools, :flow_rate_ml_per_s, :integer, default: 0
    add_column :fbos_configs, :gantry_height, :integer, default: 0
  end

  def down
    remove_column :tools, :flow_rate_ml_per_s
    remove_column :fbos_configs, :gantry_height
  end
end
