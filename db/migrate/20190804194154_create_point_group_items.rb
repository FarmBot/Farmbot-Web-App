class CreatePointGroupItems < ActiveRecord::Migration[5.2]
  def change
    create_table :point_group_items do |t|
      t.references :point_group, index: true, null: false
      t.references :point, index: true, null: false
      t.timestamps
    end
  end
end
