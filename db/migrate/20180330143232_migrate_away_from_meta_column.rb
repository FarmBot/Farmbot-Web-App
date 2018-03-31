class MigrateAwayFromMetaColumn < ActiveRecord::Migration[5.1]
  def up
    # Grab all but the first 100 logs and destroy others so we don't migrate more
    # than we need to.
    # Migrate via log[name] = log.meta[name]
    Device.all.map { |d| d.trim_log_list!(5) }
    Log.all.map do |log|
      log.meta.map do |(key,value)|
        log[key.to_sym] = log.meta[value]
        log.save!
      end
    end
  end

  def down
  end
end
