class AddMoreMissingIndexes < ActiveRecord::Migration[5.1]
  safety_assured
  def up
    add_index     :logs, :verbosity
    change_column :logs, :verbosity, :integer, default: 1
  end

  def down
  end
end
