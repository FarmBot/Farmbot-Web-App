class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar
  try :url, :sequence

  def calendar
    object.between start, finish
  end

  private

  def start
    t = options[:start]
    return t ? Time.parse(options[:start]) : Time.current.midnight - 1.day
  end

  def finish
    t = options[:finish]
    t ? Time.parse(options[:finish]) : start + 1.day
  end
end