class Alert < ApplicationRecord
  belongs_to :device
  PROBLEM_TAGS = [
    SEED_DATA = "api.seed_data.missing",
    TOUR = "api.tour.not_taken",
    USER = "api.user.not_welcomed",
    DOCUMENTATION = "api.documentation.unread"
  ]
  validates_inclusion_of :problem_tag, in: PROBLEM_TAGS
end
