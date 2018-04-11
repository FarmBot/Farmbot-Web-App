class RepairLogs < ActiveRecord::Migration[5.1]
  REPAIRABLES = [:x, :y, :z, :verbosity, :major_version, :minor_version, :type]

  def up
    Log
      .where
      .not(meta: nil)
      .map do |log|
        puts "REPAIR: #{log.try(:message).inspect}"
        meta = log[:meta] || {}
        REPAIRABLES.map do |field|
          log[field] = meta[field] || meta[field.to_s] || log[field]
        end
        log.validate!
        log.save!
      end
  end

  def down
  end
end
