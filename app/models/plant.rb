# A single organism living in the ground.
class Plant < Point
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  ATTRS = %w(meta
             name
             openfarm_slug
             plant_stage
             planted_at
             pointer_type
             radius
             x
             y
             z)
end
