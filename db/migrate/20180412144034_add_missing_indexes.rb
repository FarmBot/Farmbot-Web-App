class AddMissingIndexes < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_index :edge_nodes,      [:kind, :value]
    add_index :farm_events,     :end_time
    add_index :global_configs,  :key
    add_index :logs,            :created_at
    add_index :logs,            :type
    add_index :peripherals,     :mode
    add_index :token_issuances,  [:jti, :device_id]
    add_index :token_issuances, :exp
    add_index :users,           :confirmation_token
  end
end
