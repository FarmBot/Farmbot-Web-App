class AddDiscardUnsavedSequencesToWebAppConfig < ActiveRecord::Migration[5.2]

  def change
    add_column :web_app_configs,
    :discard_unsaved_sequences,
    :boolean,
    default: false
  end
end
