class ImageSerializer < ActiveModel::Serializer
  include Skylight::Helpers
  attributes :id, :device_id, :attachment_processed_at, :updated_at,
             :created_at, :attachment_url, :meta

  instrument_method
  def attachment_url
    url_ = object.attachment.url("x640")
    # Force google cloud users to use HTTPS://
    if Api::ImagesController::KEY.present?
      return url_.gsub("http://", "https://")
    else
      return url_
    end
  end
end
