class AddUncofirmedEmailFieldToUser < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    rename_column :users, :verification_token,   :confirmation_token
    rename_column :users, :verified_at,          :confirmed_at
    add_column    :users, :confirmation_sent_at, :datetime
    add_column    :users, :unconfirmed_email,    :string
    # add_index     :users, :confirmation_token,   unique: true
  end
end
