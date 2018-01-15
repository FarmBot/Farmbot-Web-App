class RegimenItemSerializer < ActiveModel::Serializer
  attributes :id, :regimen_id, :sequence_id, :time_offset

  def time_offset_ms
    object.time_offset
  end
end
