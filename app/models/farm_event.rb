# Not the same thing as a Regimen. A farm_event is a "dumb" list of sequecnes that
# are executed at fixed intervals. FarmEvents are less flexible than Regimens
# because they can only perform one sequence. Also unlike Regimens, they can run
# forever.
class FarmEvent < ApplicationRecord
  NEVER              = "never"
  UNITS_OF_TIME      = %w(never minutely hourly daily weekly monthly yearly)
  UNITS_OF_TIME      << NEVER
  EXECUTABLE_CLASSES = [Sequence, Regimen]
  FE_USE             = "still in use by some farm events"

  WITH_YEAR          = "%m/%d/%y"
  NO_YEAR            = "%m/%d"

  belongs_to    :device
  belongs_to    :executable, polymorphic: true
  validate      :within_20_year_window
  validates     :device_id, presence: true
  validates     :executable, presence: true

  after_destroy :cascade_destruction
  after_save    :maybe_cascade_save

  def maybe_cascade_save
    eid = the_changes["executable_id"]
    if eid
      ets = (the_changes["executable_type"] || [])
      eid.compact.uniq.each_with_index.map do |id, inx|
        klass = ets[inx] || executable_type
        Resources::RESOURCES.fetch(klass).find_by(id: id)
      end
      .compact
      .map { |model| model.delay.broadcast! }
    end
  end

  def cascade_destruction
    if executable
      executable.delay.broadcast!
    end
  end

  def within_20_year_window
    too_early = start_time && start_time < (Time.now - 20.years)
    too_late  = end_time   && end_time   > (Time.now + 20.years)
    errors.add :start_time, "too far in the past"   if too_early
    errors.add :end_time,   "too far in the future" if too_late
  end

  # Check if an executable is in use.
  def self.if_still_using(executable)
    yield if self.where(executable: executable).any?
  end

  def fancy_name
    start_time.strftime(start_time.year == Time.now.year ? NO_YEAR : WITH_YEAR)
  end
end
