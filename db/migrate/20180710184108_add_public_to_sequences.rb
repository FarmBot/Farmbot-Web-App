class AddPublicToSequences < ActiveRecord::Migration[5.2]
  def change
    add_column :sequences, :public, :boolean, default: false
  end
end
