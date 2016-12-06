class CreateTokenExpirations < ActiveRecord::Migration[5.0]
  def change
    create_table :token_expirations do |t|
      t.string  :sub
      t.integer :exp
      t.string  :jti

      t.timestamps
    end
  end
end
