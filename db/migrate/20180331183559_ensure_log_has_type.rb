class EnsureLogHasType < ActiveRecord::Migration[5.1]
  def change
    Log.where(type: nil).update_all(type: "info")
  end
end
