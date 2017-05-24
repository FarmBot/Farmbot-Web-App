class ConvertPlantedAtToDatetime < ActiveRecord::Migration[4.2]
  def change
   # Make Plant planted_at a datetime
     remove_column :plants, :planted_at
     add_column :plants, :planted_at, :datetime
  end
end
