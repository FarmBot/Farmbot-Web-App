class AddTimeFormatSecondsToWebAppConfig < ActiveRecord::Migration[6.0]
  def change
    add_column  :web_app_configs,
    :time_format_seconds,
    :boolean,
    default: false
  end
end
