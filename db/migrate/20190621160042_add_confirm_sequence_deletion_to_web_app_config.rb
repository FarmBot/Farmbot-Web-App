class AddConfirmSequenceDeletionToWebAppConfig < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :confirm_sequence_deletion,
    :boolean,
    default: true
  end
end
