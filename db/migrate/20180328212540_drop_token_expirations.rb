class DropTokenExpirations < ActiveRecord::Migration[5.1]
  def change
    drop_table :token_expirations do |t|
      t.string   :sub
      t.integer  :exp
      t.string   :jti
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
  end
end
