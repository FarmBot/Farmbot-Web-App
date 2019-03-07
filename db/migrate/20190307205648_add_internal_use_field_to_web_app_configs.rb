class AddInternalUseFieldToWebAppConfigs < ActiveRecord::Migration[5.2]
  def change
    add_column :web_app_configs, :internal_use, :text, limit: 128
  end
end
