class LogSerializer < ActiveModel::Serializer
  attributes  :id, :created_at, :channels, :major_version, :message, :meta,
              :minor_version, :type, :verbosity, :x, :y, :z

  def created_at
    object.created_at.to_time.to_i
  end
end
