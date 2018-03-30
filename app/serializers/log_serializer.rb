class LogSerializer < ActiveModel::Serializer
  attributes  :id, :created_at, :channels, :major_version, :message, :meta,
              :minor_version, :type, :verbosity, :x, :y, :z

  # Temporary stub until we deprecate the `meta` field. - RC 30-MAR-18
  def meta
    object.meta.merge({ _THIS_FIELD_IS_DEPRECATED: true })
  end

  def created_at
    object.created_at.to_time.to_i
  end
end
