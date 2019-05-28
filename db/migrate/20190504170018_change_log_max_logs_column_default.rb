class ChangeLogMaxLogsColumnDefault < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:devices, :max_log_count, 1000)
  end
end
