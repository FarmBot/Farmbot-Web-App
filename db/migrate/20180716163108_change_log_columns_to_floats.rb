class ChangeLogColumnsToFloats < ActiveRecord::Migration[5.2]
  ALL = [ :x, :y, :z ]

  safety_assured
  def up
    ALL.map { |ax| change_column :logs, ax, :float }
  end

  def down
    ALL.map { |ax| change_column :logs, ax, :integer }
  end
end
