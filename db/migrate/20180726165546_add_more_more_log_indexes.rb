class AddMoreMoreLogIndexes < ActiveRecord::Migration[5.2]
  def change
    safety_assured do # Forced to add this because of situational issues
      add_index :logs, [:device_id, :created_at]
    end
  end
end
