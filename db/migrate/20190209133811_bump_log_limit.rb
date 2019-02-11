class BumpLogLimit < ActiveRecord::Migration[5.2]
  NEW_MAX = 1000

  def change
    Device
      .where
      .not(max_log_count: 100)
      .where("max_log_count < ?", NEW_MAX)
      .update_all(max_log_count: NEW_MAX)
  end
end
