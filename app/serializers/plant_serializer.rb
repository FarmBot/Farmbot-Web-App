class PlantSerializer < BasePointSerializer
  attributes :openfarm_slug, :plant_stage, :planted_at, :radius, :meta

  def planted_at
    object.planted_at || object.created_at
  end

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
