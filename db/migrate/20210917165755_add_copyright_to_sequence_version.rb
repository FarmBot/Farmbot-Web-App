class AddCopyrightToSequenceVersion < ActiveRecord::Migration[6.1]
  def change
    add_column :sequence_versions, :copyright, :string, limit: 1500
  end
end
