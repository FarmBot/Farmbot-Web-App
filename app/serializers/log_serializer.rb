class LogSerializer < ApplicationSerializer
  attributes :id, :created_at, :updated_at, :channels, :message, :meta,
    :major_version, :minor_version, :type, :verbosity, :x, :y, :z

  def created_at
    object.created_at.to_time.to_i
  end
end
