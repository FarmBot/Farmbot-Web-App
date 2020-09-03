class CreateReleasesTable < ActiveRecord::Migration[6.0]
  def change
    create_table :releases do |t|
      t.timestamps
      t.string :image_url
      t.string :version
      t.string :platform
      t.string :channel
    end
  end
end
