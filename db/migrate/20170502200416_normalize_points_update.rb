class NormalizePointsUpdate < ActiveRecord::Migration[5.0]
  def up
    ToolSlot.includes(:tool_bay).find_each do |ts|
      Point.create!(x:         ts.x,
                    y:         ts.y,
                    z:         ts.z,
                    pointer:   ts,
                    device_id: ts.tool_bay.device_id,
                    meta:      {})
    end

    Plant.find_each do |pl|
      Point.create!(x:         pl.x,
                    y:         pl.y,
                    z:         pl.z,
                    pointer:   ts,
                    device_id: pl.device_id,
                    meta:      {})
    end
  end

  def down
    puts "I hope this never happens"
  end
end
