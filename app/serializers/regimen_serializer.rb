class RegimenSerializer < ApplicationSerializer
  attributes :name, :color, :device_id, :in_use
  has_many   :regimen_items

  def in_use
    object.farm_events.any?
  end
end
