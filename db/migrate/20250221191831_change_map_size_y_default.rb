class ChangeMapSizeYDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :map_size_y, from: 1400, to: 1230)
  end
end
