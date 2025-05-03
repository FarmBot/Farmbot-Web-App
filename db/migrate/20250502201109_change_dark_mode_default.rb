class ChangeDarkModeDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :dark_mode, from: false, to: true)
  end
end
