class FarmEventSerializer < ApplicationSerializer
  class BadExe < StandardError; end
  attributes :start_time, :end_time, :repeat, :time_unit, :executable_id,
    :executable_type, :calendar, :body

  def calendar
    []
  end

  def body
    puts "TODO: Preload associations"
    f = object.fragment
    binding.pry if f
    f ? f.serialize.fetch(:body) : []
  end
end
