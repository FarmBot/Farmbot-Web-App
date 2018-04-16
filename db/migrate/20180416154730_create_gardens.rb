class CreateGardens < ActiveRecord::Migration[5.1]
  def change
    create_table :gardens do |t|
      t.string     :name,   null: false
      t.references :device, null: false
      t.timestamps
    end
    add_reference :points, :garden, index: true
  end
end
