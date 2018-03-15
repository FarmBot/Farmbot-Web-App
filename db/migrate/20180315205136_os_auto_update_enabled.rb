class OsAutoUpdateEnabled < ActiveRecord::Migration[5.1]
  BEFORE = false
  AFTER  = true

  def up
    change_column :fbos_configs, :os_auto_update, :boolean, default: AFTER
  end

  def down
    change_column :fbos_configs, :os_auto_update, :boolean, default: BEFORE
  end
end
