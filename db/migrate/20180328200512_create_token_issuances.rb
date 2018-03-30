class CreateTokenIssuances < ActiveRecord::Migration[5.1]
  def change
    create_table :token_issuances do |t|
      t.references :device, foreign_key: true, null: false
      t.integer :exp, null: false
      t.string :jti, null: false, limit: 45

      t.timestamps
    end
  end
end
