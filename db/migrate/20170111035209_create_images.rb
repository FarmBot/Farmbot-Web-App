class CreateImages < ActiveRecord::Migration[5.0]
  def change
    create_table :images do |t|
      t.timestamps
    end
    add_attachment :images, :attachment
  end
end
