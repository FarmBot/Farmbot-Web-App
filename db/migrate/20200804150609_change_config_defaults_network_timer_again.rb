class ChangeConfigDefaultsNetworkTimerAgain < ActiveRecord::Migration[6.0]
  def change
    change_column_default(:fbos_configs,
                          :disable_factory_reset,
                          from: false,
                          to: true)
  end
end
