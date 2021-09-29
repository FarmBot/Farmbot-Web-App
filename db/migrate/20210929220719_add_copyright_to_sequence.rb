class AddCopyrightToSequence < ActiveRecord::Migration[6.1]
  def change
    add_column :sequences, :copyright, :string, limit: 1500
  end
end
