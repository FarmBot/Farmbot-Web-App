class NormalizePointsUpdate < ActiveRecord::Migration[5.0]
  def up
    ToolSlot.includes(:tool_bay).find_each do |ts|
      p = Point.create!(x:         ts.x,
                        y:         ts.y,
                        z:         ts.z,
                        device_id: ts.tool_bay.device_id,
                        kind:      "ToolSlot",
                        meta:      {})
      ts.update_attributes!(point: p)
    end

    Plant.find_each do |pl|
      p = Point.create!(x:         pl.x,
                        y:         pl.y,
                        z:         pl.z,
                        device_id: pl.device_id,
                        kind:      "Plant",
                        meta:      {})
      ts.update_attributes!(point: p)
    end
  end

  def down
    puts "I hope this never happens"
  end
end
