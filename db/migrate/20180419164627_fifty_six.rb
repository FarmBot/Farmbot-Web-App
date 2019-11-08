class FiftySix < ActiveRecord::Migration[5.1]
  BAD         = 56
  GOOD        = 5556
  ALL_OF_THEM = [ :encoder_scaling_x, :encoder_scaling_y, :encoder_scaling_z ]


  def up
    ALL_OF_THEM.map do |attr|
      FirmwareConfig.where(attr => BAD).update_all(attr => GOOD)
    end
  end

  def down
  end
end
