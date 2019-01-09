class FarmEventSerializer < ApplicationSerializer
  attributes :start_time, :end_time, :repeat, :time_unit, :executable_id,
    :executable_type, :calendar, :body

  def calendar
    []
  end
end
