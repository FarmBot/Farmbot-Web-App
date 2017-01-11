class ImageSerializer < ActiveModel::Serializer
  attributes :id, :device_id, :attachment_processed_at, :updated_at,
             :created_at, :attachment_url

  def attachment_url
    object.attachment.url("x640")
  end
end
