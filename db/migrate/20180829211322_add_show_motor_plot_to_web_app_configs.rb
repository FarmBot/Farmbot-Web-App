class AddShowMotorPlotToWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column  :web_app_configs,
                :show_motor_plot,
                :boolean,
                default: false
  end
end
