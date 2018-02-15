class PeripheralSerializer < ActiveModel::Serializer
  attributes :id, :pin, :label, :mode

  def mode
    -1 # DEPRECATED. Still here for legacy reasons. Don't use it. - RC
  end
end
