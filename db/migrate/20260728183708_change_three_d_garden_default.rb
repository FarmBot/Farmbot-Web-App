class ChangeThreeDGardenDefault < ActiveRecord::Migration[8.1]
  def change
    change_column_default(:web_app_configs, :three_d_garden, from: false, to: true)
  end
end
