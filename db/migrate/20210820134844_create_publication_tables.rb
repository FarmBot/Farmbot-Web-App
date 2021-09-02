class CreatePublicationTables < ActiveRecord::Migration[6.1]
  def change
    # t.bigint, t.datetime, t.float,
    # t.hstore, t.integer, t.string, t.text
    create_table :sequence_publications do |t|
      # cached_user_email
      t.string "cached_author_email", null: false
      t.integer "author_device_id", null: false
      t.integer "author_sequence_id", null: false
      t.boolean "published", null: false, default: true
      t.timestamps
    end

    create_table :sequence_versions do |t|
      t.references :sequence_publication, null: false
      t.text :description, limit: 5000
      t.string :name, null: false
      t.string :color, null: false
      t.timestamps
    end

    change_column_null(:fragments, :device_id, true)
    add_column :sequences, :description, :text, limit: 5000
    add_column :sequences, :forked, :boolean, default: false
    add_reference :sequences, :sequence_version, index: true
    remove_column :sequences, :kind, :string
  end
end
