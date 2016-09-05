class ConvertXYToFloatAndRemoveScheduleIdFromRegimenItem < ActiveRecord::Migration
  def change
   # Make Plant x/y a float
   [:x,:y].each do |coord|
     remove_column :plants, coord
     add_column :plants, coord, :float, default: 0
   end
   # Remove schedule_id from regimen_item.
   remove_column :plants, :schedule_id
  end
end
