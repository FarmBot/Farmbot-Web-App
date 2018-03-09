class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :name, :timezone, :last_saw_api, :last_saw_mq, :last_seen,
             :tz_offset_hrs, :fbos_version

  def last_seen
    # TODO: Remove this by December 2017.
    # This is a legacy attribute that needs to go away, but will cause
    # crashes on legacy versions of FBOS.
    object.last_saw_api
  end
end
