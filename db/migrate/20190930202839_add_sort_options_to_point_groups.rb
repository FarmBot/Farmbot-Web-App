class AddSortOptionsToPointGroups < ActiveRecord::Migration[5.2]


  def change
    add_column :point_groups,
               :sort_type,
               :string,
               limit: 20,
               default: "xy_ascending"
  end
end
