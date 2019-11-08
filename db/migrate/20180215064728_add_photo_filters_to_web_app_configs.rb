class AddPhotoFiltersToWebAppConfigs < ActiveRecord::Migration[5.1]

  def change
    add_column :web_app_configs, :photo_filter_begin, :string
    add_column :web_app_configs, :photo_filter_end, :string
  end
end
