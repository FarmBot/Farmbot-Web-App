class LogSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :message, :meta, :channels

  def created_at
    object.created_at.to_time.to_i
  end
end
