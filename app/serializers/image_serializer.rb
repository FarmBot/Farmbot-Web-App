class ImageSerializer < ActiveModel::Serializer
  include Skylight::Helpers
  attributes :id, :device_id, :attachment_processed_at, :updated_at,
             :created_at, :attachment_url, :meta

  instrument_method
  def attachment_url
    object.attachment.url("x640")
  end
end
