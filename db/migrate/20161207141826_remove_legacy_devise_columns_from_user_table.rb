class RemoveLegacyDeviseColumnsFromUserTable < ActiveRecord::Migration[5.0]
  def change
    remove_column :users, :reset_password_token, :string
    remove_column :users, :reset_password_sent_at, :datetime
    remove_column :users, :remember_created_at, :datetime
  end
end
