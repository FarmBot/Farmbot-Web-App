class AddMoreLogIndexes < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_index :logs, :updated_at
    add_index :logs, :sent_at
  end
end
