class AddPinnedToSequences < ActiveRecord::Migration[6.1]
  def change
    add_column :sequences, :pinned, :boolean, default: false
  end
end
