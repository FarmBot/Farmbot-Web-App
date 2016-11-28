class SendWelcomeEmailJob < ApplicationJob
  queue_as :default

  def perform(user)
    # This is a stub until we come back and add real background workers.
    puts "Welcome, #{user.email}!"
  end
end
