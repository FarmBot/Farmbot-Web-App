class AddAgreedToTermsToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :agreed_to_terms_at, :datetime
    add_index  :users, :agreed_to_terms_at
  end
end
