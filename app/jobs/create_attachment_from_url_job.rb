class CreateAttachmentFromUrlJob < ApplicationJob
  queue_as :default

  def perform(image:,attachment_url:)
    puts "HALLPPPP!!!"
    binding.pry
  end
end
