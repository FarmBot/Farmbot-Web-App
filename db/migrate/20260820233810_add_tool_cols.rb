class AddToolCols < ActiveRecord::Migration[8.1]
  def up
    add_column :points, :mount_offset_x, :float, default: 0, null: false
    add_column :points, :mount_offset_y, :float, default: 0, null: false
    add_column :points, :mount_offset_z, :float, default: 0, null: false
    add_column :points, :mount_stage, :integer, default: 0, null: false
    add_column :tools, :type, :string, limit: 15, default: "none", null: false
    add_column :tools, :utm_mountable, :boolean, default: true, null: false
    add_column :tools, :effector_offset_x, :float, default: 0, null: false
    add_column :tools, :effector_offset_y, :float, default: 0, null: false
    add_column :tools, :effector_offset_z, :float, default: 0, null: false
    add_column :peripherals, :type, :string, limit: 15, default: "none", null: false
    add_column :sensors, :type, :string, limit: 20, default: "none", null: false

    execute <<~SQL
      UPDATE points
      SET mount_stage = 1
      WHERE pointer_type = 'ToolSlot'
        AND gantry_mounted = TRUE;

      UPDATE tools
      SET type = CASE
        WHEN name ILIKE '%rotary%' THEN 'rotary_tool'
        WHEN name ILIKE '%weeder%' THEN 'weeder'
        WHEN name ILIKE '%watering nozzle%' THEN 'watering_nozzle'
        WHEN name ILIKE '%seeder%' THEN 'seeder'
        WHEN name ILIKE '%soil sensor%' THEN 'soil_sensor'
        WHEN name ILIKE '%seed bin%' THEN 'seed_bin'
        WHEN name ILIKE '%seed tray%' THEN 'seed_tray'
        WHEN name ILIKE '%seed trough%' THEN 'seed_trough'
      END
      WHERE name ILIKE ANY (ARRAY[
        '%rotary%',
        '%weeder%',
        '%watering nozzle%',
        '%seeder%',
        '%soil sensor%',
        '%seed bin%',
        '%seed tray%',
        '%seed trough%'
      ]);

      UPDATE tools
      SET utm_mountable = FALSE
      WHERE type IN ('seed_bin', 'seed_tray', 'seed_trough');

      UPDATE tools
      SET effector_offset_x = 17.5,
          effector_offset_z = COALESCE(seeder_tip_z_offset, 80)
      WHERE type = 'seeder';

      UPDATE tools
      SET effector_offset_z = 80
      WHERE type = 'rotary_tool';

      UPDATE tools
      SET effector_offset_z = 60
      WHERE type = 'soil_sensor';

      UPDATE peripherals
      SET type = CASE
        WHEN fbos_configs.firmware_hardware = 'arduino'
          AND peripherals.pin = 9 THEN 'water'
        WHEN fbos_configs.firmware_hardware = 'arduino'
          AND peripherals.pin = 10 THEN 'vacuum'
        WHEN fbos_configs.firmware_hardware IS DISTINCT FROM 'arduino'
          AND peripherals.pin = 7 THEN 'lighting'
        WHEN fbos_configs.firmware_hardware IS DISTINCT FROM 'arduino'
          AND peripherals.pin = 8 THEN 'water'
        WHEN fbos_configs.firmware_hardware IS DISTINCT FROM 'arduino'
          AND peripherals.pin = 9 THEN 'vacuum'
        WHEN fbos_configs.firmware_hardware IS DISTINCT FROM 'arduino'
          AND peripherals.pin IN (2, 3) THEN 'rotary_tool'
      END
      FROM fbos_configs
      WHERE fbos_configs.device_id = peripherals.device_id
        AND (
          (fbos_configs.firmware_hardware = 'arduino'
            AND peripherals.pin IN (9, 10))
          OR (fbos_configs.firmware_hardware IS DISTINCT FROM 'arduino'
            AND peripherals.pin IN (2, 3, 7, 8, 9))
        );

      UPDATE sensors
      SET type = CASE
        WHEN pin = 59 THEN 'soil_moisture'
        WHEN pin = 63 THEN 'tool_verification'
        WHEN pin IN (54, 55, 56, 57, 58, 60) THEN 'current'
      END
      WHERE pin IN (54, 55, 56, 57, 58, 59, 60, 63);
    SQL
  end

  def down
    remove_column :points, :mount_offset_x
    remove_column :points, :mount_offset_y
    remove_column :points, :mount_offset_z
    remove_column :points, :mount_stage
    remove_column :tools, :type
    remove_column :tools, :utm_mountable
    remove_column :tools, :effector_offset_x
    remove_column :tools, :effector_offset_y
    remove_column :tools, :effector_offset_z
    remove_column :peripherals, :type
    remove_column :sensors, :type
  end
end
