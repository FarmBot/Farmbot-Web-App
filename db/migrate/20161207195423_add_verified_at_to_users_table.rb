class AddVerifiedAtToUsersTable < ActiveRecord::Migration[5.0]
  def up
    add_column :users, :verified_at, :datetime
    User.update_all(verified_at: Time.now)
  end

  def down
    remove_column :users, :verified_at, :datetime
  end
end
