class AddExperimentalFeaturesToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :experimental_features, :boolean, default: false
  end
end
