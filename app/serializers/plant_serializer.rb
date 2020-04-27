class PlantSerializer < BasePointSerializer
  attributes :openfarm_slug, :plant_stage, :planted_at, :radius, :meta

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
