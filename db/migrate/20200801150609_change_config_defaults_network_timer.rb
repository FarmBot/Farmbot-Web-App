class ChangeConfigDefaultsNetworkTimer < ActiveRecord::Migration[6.0]
  def change
    change_column_default(:fbos_configs,
      :disable_factory_reset,
      from: true,
      to: false)
  end
end
