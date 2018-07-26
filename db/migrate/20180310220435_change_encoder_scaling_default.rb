class ChangeEncoderScalingDefault < ActiveRecord::Migration[5.1]
  ALL    = [:encoder_scaling_x, :encoder_scaling_y, :encoder_scaling_z]
  AFTER  = 5556
  BEFORE = 56
  safety_assured
  def up
    ALL.map do |enc|
      change_column :firmware_configs, enc, :integer, default: AFTER
    end

    ALL.map do |enc|
      FirmwareConfig.where(enc => BEFORE).update_all(enc => AFTER)
    end
  end

  def down
    ALL.map do |enc|
      change_column :firmware_configs, enc, :integer, default: BEFORE
    end

    ALL.map do |enc|
      FirmwareConfig.where(enc => AFTER).update_all(enc => BEFORE)
    end
  end
end
