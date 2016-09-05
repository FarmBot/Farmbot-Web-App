class MakeRegimenItemOffsetBigger < ActiveRecord::Migration
  def change
    change_column :regimen_items, :time_offset, :integer, limit: 8
  end
end
