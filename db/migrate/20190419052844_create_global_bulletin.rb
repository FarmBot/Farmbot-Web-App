class CreateGlobalBulletin < ActiveRecord::Migration[5.2]
  def change
    create_table :global_bulletins do |t|
      t.string :href
      t.string :slug
      t.string :title
      t.string :type
      t.text   :content
      t.timestamps
    end
  end
end
