class AddCriteriaToPointGroups < ActiveRecord::Migration[6.0]
  def change
    add_column :point_groups, :criteria, :text, limit: 1000
  end
end
