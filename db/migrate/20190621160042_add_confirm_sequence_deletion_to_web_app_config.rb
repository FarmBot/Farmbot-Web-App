class AddConfirmSequenceDeletionToWebAppConfig < ActiveRecord::Migration[5.2]

  def change
    add_column :web_app_configs,
    :confirm_sequence_deletion,
    :boolean,
    default: true
  end
end
