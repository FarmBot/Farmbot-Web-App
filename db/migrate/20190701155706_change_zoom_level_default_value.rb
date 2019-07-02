class ChangeZoomLevelDefaultValue < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:web_app_configs, :zoom_level, from: 1, to: -2)
  end
end
