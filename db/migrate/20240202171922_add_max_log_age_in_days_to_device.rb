class AddMaxLogAgeInDaysToDevice < ActiveRecord::Migration[6.1]
  def up
    add_column :devices, :max_log_age_in_days, :integer, default: 0
  end

  def down
    remove_column :devices, :max_log_age_in_days
  end
end
