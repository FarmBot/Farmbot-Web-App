class AddDiscardUnsavedChanges < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column  :web_app_configs,
                :discard_unsaved,
                :boolean,
                default: false
  end
end
