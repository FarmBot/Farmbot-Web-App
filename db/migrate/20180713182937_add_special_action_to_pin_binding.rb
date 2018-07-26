class AddSpecialActionToPinBinding < ActiveRecord::Migration[5.2]
  safety_assured
  def up
    execute <<-SQL
      CREATE TYPE special_action AS
        ENUM ('dump_info', 'emergency_lock', 'emergency_unlock', 'power_off',
              'read_status', 'reboot', 'sync', 'take_photo');
    SQL

    add_column :pin_bindings, :special_action, :special_action, index: true
  end

  def down
    remove_column :pin_bindings, :special_action

    execute <<-SQL
      DROP TYPE special_action;
    SQL
  end
end
