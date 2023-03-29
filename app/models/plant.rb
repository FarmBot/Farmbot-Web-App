# A single organism living in the ground.
class Plant < Point
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  ATTRS = %w(meta
             name
             openfarm_slug
             plant_stage
             planted_at
             water_curve_id
             spread_curve_id
             height_curve_id
             pointer_type
             radius
             depth
             x
             y
             z)
end
