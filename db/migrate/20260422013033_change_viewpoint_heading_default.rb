class ChangeViewpointHeadingDefault < ActiveRecord::Migration[8.1]
  def change
    change_column_default(:web_app_configs, :viewpoint_heading, from: 0, to: 30)
  end
end
