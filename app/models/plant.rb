# A single organism living in the ground.
class Plant < Point
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"

  def broadcast?
    false
  end
end
