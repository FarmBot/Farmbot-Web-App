class CreateFarmwareInstallations < ActiveRecord::Migration[5.1]
  def change
    create_table :farmware_installations do |t|
      t.references :device, foreign_key: true
      t.string :url

      t.timestamps
    end
  end
end
