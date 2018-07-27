class IndexLogsTypeVerbosity < ActiveRecord::Migration[5.2]
  disable_ddl_transaction!

  def change
    add_index :logs, [:verbosity, :type], algorithm: :concurrently
  end
end
