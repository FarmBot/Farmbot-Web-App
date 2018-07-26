class AddMoreLogIndexes < ActiveRecord::Migration[5.2]
  def change
    safety_assured do # Forced to add this because of situational issues
      add_index :logs, :updated_at
      add_index :logs, :sent_at
    end
  end
end
