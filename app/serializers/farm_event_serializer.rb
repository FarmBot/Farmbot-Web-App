class FarmEventSerializer < ApplicationSerializer
  class BadExe < StandardError; end
  attributes :id, :start_time, :end_time, :repeat, :time_unit, :executable_id,
    :executable_type, :calendar

  def calendar
    []
  end
end
