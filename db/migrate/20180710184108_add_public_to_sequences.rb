class AddPublicToSequences < ActiveRecord::Migration[5.2]
  def change
    add_column :sequences, :is_public, :boolean, default: false
  end
end
