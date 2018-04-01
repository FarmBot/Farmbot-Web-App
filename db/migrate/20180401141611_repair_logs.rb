class RepairLogs < ActiveRecord::Migration[5.1]
  def up
    Log
      .where
      .not(meta: nil)
      .select { |x| (x[:meta] || {})[:type] != x.type }
      .map do |x|
        old_type = (x[:meta] || {})[:type]
        x.update_attributes!(type: old_type) if old_type
      end
  end

  def down
  end
end
