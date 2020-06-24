class AddDisplayMapMissedStepsToWebAppConfig < ActiveRecord::Migration[6.0]
  def change
    add_column  :web_app_configs,
    :display_map_missed_steps,
    :boolean,
    default: false
  end
end
