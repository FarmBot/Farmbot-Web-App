class RegimenItemSerializer < ActiveModel::Serializer
  # TODO
  attributes :id, :regimen_id, :time_offset
  has_one :sequence
end
