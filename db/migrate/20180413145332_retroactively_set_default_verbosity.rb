class RetroactivelySetDefaultVerbosity < ActiveRecord::Migration[5.1]

  def change
    Log.where(verbosity: nil).update_all(verbosity: 1)
  end
end
