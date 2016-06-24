# a single organism living in the
# ground (planting_area) that FarmBot watches over.
class Plant
  include Mongoid::Document

  belongs_to :device
  belongs_to :planting_area

  field :name,          default: "Unknown Plant"
  field :img_url,       default: "http://placehold.it/200x150"
  field :icon_url,      default: "/icons/Natural Food-96.png"
  field :openfarm_slug, default: "not-set"

  field :x,          type: Integer
  field :y,          type: Integer
  field :planted_at, type: Time, default: ->{ Time.now.utc }
end
