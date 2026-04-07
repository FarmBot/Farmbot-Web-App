class CleanOutOldDbItemsJob < ApplicationJob
  queue_as :default

  def perform(*)
    TokenIssuance.clean_old_tokens
  end
end
