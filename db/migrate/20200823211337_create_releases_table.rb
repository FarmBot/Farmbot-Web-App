class CreateReleasesTable < ActiveRecord::Migration[6.0]
  def change
    create_table :releases_tables do |t|
      t.timestamps
      t.string :image_url
      t.string :version, unique: true
      t.string :platform
      t.string :channel
    end
  end
end
