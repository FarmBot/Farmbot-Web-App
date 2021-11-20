class AddBeepVerbosityToWebAppConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :web_app_configs, :beep_verbosity, :integer, default: 0
  end
end
