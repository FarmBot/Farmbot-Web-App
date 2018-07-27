class AddMigratedNodesToSequences < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :sequences, :migrated_nodes, :boolean, default: false
  end
end
