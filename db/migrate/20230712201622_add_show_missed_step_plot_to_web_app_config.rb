class AddShowMissedStepPlotToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :show_missed_step_plot, :boolean, default: false
  end

  def down
    remove_column :web_app_configs, :show_missed_step_plot
  end
end
