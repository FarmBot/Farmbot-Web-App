class AddFolderColumns < ActiveRecord::Migration[6.0]
  def change
    create_table :folders do |t|
      t.references :device, null: false
      t.timestamps
      # https://twitter.com/wesbos/status/719678818831757313?lang=en
      t.string :color, limit: 20, null: false
      t.string :name, limit: 40, null: false
    end
    add_column :folders,
               :parent_id,
               :integer,
               null: true,
               index: true
    add_foreign_key :folders,
                    :folders,
                    column: :parent_id

    add_reference :sequences, :folder, index: true
  end
end
