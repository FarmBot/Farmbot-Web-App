class EnsureLogHasType < ActiveRecord::Migration[5.1]
  def up
    Log.where(type: nil).update_all(type: "info")
  end

  def down
  end
end
