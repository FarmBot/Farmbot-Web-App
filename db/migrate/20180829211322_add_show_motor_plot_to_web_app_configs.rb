class AddShowMotorPlotToWebAppConfigs < ActiveRecord::Migration[5.2]

  def change
    add_column  :web_app_configs,
                :show_motor_plot,
                :boolean,
                default: false
  end
end
