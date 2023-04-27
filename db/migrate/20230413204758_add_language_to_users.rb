class AddLanguageToUsers < ActiveRecord::Migration[6.1]
  def up
    add_column :users, :language, :string, limit: 100, default: "English"
  end

  def down
    remove_column :users, :language
  end
end
