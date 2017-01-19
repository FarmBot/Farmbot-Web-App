class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar
  try :url, :sequence

  def calendar
    object.between start, finish
  end

  private

  def start
    if options[:start]
      Time.parse(options[:start])
    else
      Time.current.midnight - 1.day
    end
  end

  def finish
    if options[:finish]
      Time.parse(options[:finish])
    else
      start + 1.day
    end
  end
end
