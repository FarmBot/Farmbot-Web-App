class AddVerifiedAtToUsersTable < ActiveRecord::Migration[5.0]
  def up
    add_column :users, :verified_at,        :datetime
    add_column :users, :verification_token, :string
    User.update_all(verified_at: Time.now)
  end

  def down
    remove_column :users, :verified_at,        :datetime
    remove_column :users, :verification_token, :string
  end
end
