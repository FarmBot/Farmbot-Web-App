class RegimenItemSerializer < ActiveModel::Serializer
  attributes :id, :regimen_id, :time_offset
  has_one :sequence
end
