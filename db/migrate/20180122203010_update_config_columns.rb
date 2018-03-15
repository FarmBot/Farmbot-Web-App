class UpdateConfigColumns < ActiveRecord::Migration[5.1]
  def change
    # arduino_debug_messages
    add_column    :fbos_configs, :api_migrated,           :boolean, default: false
    remove_column :fbos_configs, :os_auto_update,         :number,  default: 0
    add_column    :fbos_configs, :os_auto_update,         :boolean, default: false
    remove_column :fbos_configs, :arduino_debug_messages, :number, default: 0
    add_column    :fbos_configs, :arduino_debug_messages, :boolean, default: false
  end
end
