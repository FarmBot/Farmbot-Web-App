class CleanOutOldDbItemsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    TokenIssuance.clean_old_tokens
  end
end
