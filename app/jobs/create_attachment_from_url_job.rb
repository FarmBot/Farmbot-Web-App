# Bots and Users upload images to Google Cloud Storage, creating a URL.
# API users POST that URL to us and we download it in the background.
# Used by weed detection and photo taking sequences.
class CreateAttachmentFromUrlJob < ApplicationJob
  queue_as :default

  def perform(image:, attachment_url:)
    image
      .device
      .auto_sync_transaction do
        image.set_attachment_by_url(attachment_url)
        image.save!
      end
  end

  def max_attempts
    2
  end
end
