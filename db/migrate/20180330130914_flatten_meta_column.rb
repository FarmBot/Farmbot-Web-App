class FlattenMetaColumn < ActiveRecord::Migration[5.1]
  def change
    add_column :logs, :type,          :string, limit: 10
    add_column :logs, :major_version, :integer
    add_column :logs, :minor_version, :integer
    add_column :logs, :verbosity,     :integer
    add_column :logs, :x,             :integer
    add_column :logs, :y,             :integer
    add_column :logs, :z,             :integer
  end
end
