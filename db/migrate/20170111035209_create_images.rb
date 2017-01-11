class CreateImages < ActiveRecord::Migration[5.0]
  def change
    create_table :images do |t|
      t.integer :device_id
      t.datetime :image_processed_at
      t.timestamps
    end

    add_index :images, :device_id
    add_attachment :images, :attachment
  end
end
