class CreatePublicationTables < ActiveRecord::Migration[6.1]
  def change
    # t.bigint, t.datetime, t.float,
    # t.hstore, t.integer, t.string, t.text
    create_table :sequence_publications do |t|
      # cached_user_email
      t.string "cached_author_email", null: false
      t.integer "author_device_id", null: false
      t.integer "author_sequence_id", null: false
      t.timestamps
    end

    create_table :sequence_versions do |t|
      t.references :sequence_publication, null: false
      t.timestamps
    end
  end
end
