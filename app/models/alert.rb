class Alert < ApplicationRecord
  belongs_to :device
  DEFAULTS = [
    SEED_DATA = { problem_tag: "api.seed_data.missing", priority: 400 },
    DOCUMENTATION = { problem_tag: "api.documentation.unread", priority: 300 },
    TOUR = { problem_tag: "api.tour.not_taken", priority: 200 },
    USER = { problem_tag: "api.user.not_welcomed", priority: 100 },
    BULLETIN = { problem_tag: "api.bulletin.unread", priority: 100}
  ]

  PROBLEM_TAGS = DEFAULTS.map { |x| x.fetch(:problem_tag) }

  validates_inclusion_of :problem_tag, in: PROBLEM_TAGS
end
