class AddSentAtToLog < ActiveRecord::Migration[5.2]
  def change
    add_column :logs, :sent_at, :datetime
  end
end
