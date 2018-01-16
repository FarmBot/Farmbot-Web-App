class RegimenItemSerializer < ActiveModel::Serializer
  attributes :id, :regimen_id, :sequence_id, :time_offset
end
