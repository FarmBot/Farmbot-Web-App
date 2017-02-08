class CreatePoints < ActiveRecord::Migration[5.0]
  def change
    enable_extension "hstore"

    create_table :points do |t|
      t.float :radius
      t.float :x
      t.float :y
      t.float :z
      t.references :device, foreign_key: true
      t.hstore :meta

      t.timestamps
    end
    add_index :points, :meta, using: :gin
  end
end
