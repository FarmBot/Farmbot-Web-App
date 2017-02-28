class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar
  try :url, :sequence

  NEVER = FarmEvent::NEVER.to_s
  TIME = {
    "minutely" => 60,
    "hourly"   => 60 * 60,
    "daily"    => 60 * 60 * 24,
    "weekly"   => 60 * 60 * 24 * 7,
    "monthly"  => 60 * 60 * 24 * 30, # Not perfect...
    "yearly"   => 60 * 60 * 24 * 365
  }

  def calendar
    if object.time_unit == NEVER
      return []
    else
      one_interval = (object.repeat * TIME[object.time_unit]).seconds
      return [*(1..20)].map { |i| (Time.now + (i * one_interval)).utc.as_json }
    end
  end
end
