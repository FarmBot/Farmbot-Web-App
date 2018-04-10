class AddDiscardedAtToPoints < ActiveRecord::Migration[5.1]
  def change
    add_column :points, :discarded_at, :datetime
    add_index  :points, :discarded_at
  end
end
