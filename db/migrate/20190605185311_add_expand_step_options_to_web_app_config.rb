class AddExpandStepOptionsToWebAppConfig < ActiveRecord::Migration[5.2]

  def change
    add_column :web_app_configs,
    :expand_step_options,
    :boolean,
    default: false
  end
end
