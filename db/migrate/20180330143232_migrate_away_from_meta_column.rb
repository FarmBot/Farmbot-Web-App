class MigrateAwayFromMetaColumn < ActiveRecord::Migration[5.1]
  def up
    # Grab all but the first 100 logs and destroy others so we don't migrate more
    # than we need to.
    # Migrate via log[name] = log.meta[name]
    Device.all.map { |d| d.trim_log_list!(5) }
    Log.all.map do |log|
      old_meta = log[:meta] || {}
      (old_meta).map do |(key,value)|
        old_value = old_meta[value]
        if old_value
          log[key.to_sym] = old_value
          log.save!
        end
      end
    end
  end

  def down
  end
end
