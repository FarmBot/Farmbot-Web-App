class CreateGlobalBulletin < ActiveRecord::Migration[5.2]
  def change
    create_table :global_bulletins do |t|
      t.text :content
      t.string :href
      t.string :slug
      t.string :type
      t.string :name
      t.timestamps
    end
  end
end
