class CreatePointGroups < ActiveRecord::Migration[5.2]
  def change
    create_table :point_groups do |t|
      t.string :name, limit: 80, null: false
      t.references :device, index: true, null: false
      t.timestamps
    end
  end
end
