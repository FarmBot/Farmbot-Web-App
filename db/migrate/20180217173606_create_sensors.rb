class CreateSensors < ActiveRecord::Migration[5.1]
  def change
    create_table :sensors do |t|
      t.references :device, foreign_key: true
      t.integer :pin
      t.string :label
      t.integer :mode

      t.timestamps
    end
  end
end
