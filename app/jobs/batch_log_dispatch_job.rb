class BatchLogDispatchJob < ApplicationJob
  queue_as :default

  def perform(device, logs)
    LogDispatch.deliver(device, Log.create!(logs))
  end
end
