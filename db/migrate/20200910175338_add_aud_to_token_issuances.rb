class AddAudToTokenIssuances < ActiveRecord::Migration[6.0]
  def change
    add_column :token_issuances, :aud, :string, limit: 8, default: "unknown"
  end
end
