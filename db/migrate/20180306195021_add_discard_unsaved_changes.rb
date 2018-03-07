class AddDiscardUnsavedChanges < ActiveRecord::Migration[5.1]
  def change
    add_column  :web_app_configs,
                :discard_unsaved,
                :boolean,
                default: false
  end
end
