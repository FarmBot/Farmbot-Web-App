class PlantSerializer < BasePointSerializer
  attributes :openfarm_slug,
             :plant_stage,
             :planted_at,
             :radius,
             :depth,
             :meta,
             :water_curve_id,
             :spread_curve_id,
             :height_curve_id

  def x
    object.x.round
  end

  def y
    object.y.round
  end

  def z
    object.z.round
  end

  def meta
    object.meta || {}
  end
end
