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
