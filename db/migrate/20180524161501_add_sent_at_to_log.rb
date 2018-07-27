class AddSentAtToLog < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :logs, :sent_at, :datetime
  end
end
