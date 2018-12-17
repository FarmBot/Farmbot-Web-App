class FarmEventSerializer < ApplicationSerializer
  class BadExe < StandardError; end
  attributes :start_time, :end_time, :repeat, :time_unit, :executable_id,
    :executable_type, :calendar, :body

  def calendar
    []
  end

  def body
    # Hmm...
  end
end
