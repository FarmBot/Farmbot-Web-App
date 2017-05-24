class CreatePeripherals < ActiveRecord::Migration[4.1]
  def change
    create_table :peripherals do |t|
      t.references :device, index: true, foreign_key: true
      t.integer :pin
      t.integer :mode
      t.string :label

      t.timestamps null: false
    end
  end
end
