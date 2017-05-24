class MakeRegimenItemOffsetBigger < ActiveRecord::Migration[4.1]
  def change
    change_column :regimen_items, :time_offset, :integer, limit: 8
  end
end
