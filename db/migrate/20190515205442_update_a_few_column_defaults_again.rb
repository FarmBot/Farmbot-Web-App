class UpdateAFewColumnDefaultsAgain < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:devices, :name, from: "Farmbot", to: "FarmBot")
  end
end
