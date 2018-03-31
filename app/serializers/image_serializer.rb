class ImageSerializer < ActiveModel::Serializer
  attributes :id, :device_id, :attachment_processed_at, :updated_at,
             :created_at, :attachment_url, :meta

  def attachment_url
    url_ = object.attachment.url("x640")
    # Force google cloud users to use HTTPS://
    x = Api::ImagesController::KEY.present? ?
      url_.gsub("http://", "https://") : url_
    return x
  end
end
