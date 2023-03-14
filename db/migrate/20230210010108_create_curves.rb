class CreateCurves < ActiveRecord::Migration[6.1]
  def up
    create_table :curves do |t|
      t.references :device, index: true, null: false
      t.string     :name, limit: 80, null: false
      t.string     :type, limit: 10, null: false
      t.string     :data, limit: 500, null: false

      t.timestamps
    end

    add_column :points, :water_curve_id, :integer
    add_column :points, :spread_curve_id, :integer
    add_column :points, :height_curve_id, :integer
  end

  def down
    drop_table :curves do |t|
      t.references :device, index: true, null: false
      t.string     :name, limit: 80, null: false
      t.string     :type, limit: 10, null: false
      t.string     :data, limit: 500, null: false

      t.timestamps
    end

    remove_column :points, :water_curve_id, :integer
    remove_column :points, :spread_curve_id, :integer
    remove_column :points, :height_curve_id, :integer
  end
end
