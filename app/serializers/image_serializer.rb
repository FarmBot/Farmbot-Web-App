class ImageSerializer < ApplicationSerializer
  attributes :device_id, :attachment_processed_at, :attachment_url, :meta
end
