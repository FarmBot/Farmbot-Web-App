class Sequence
  include Mongoid::Document

  belongs_to :schedule
  belongs_to :user
  embeds_many :steps
  has_many :schedules, dependent: :destroy

  field :name
  validates :name, presence: true

  # allowable label colors for the frontend.
  COLORS = %w(blue green yellow orange purple pink gray red)
  field :color, type: String, default: -> { COLORS.sample }
  validates_inclusion_of :color, in: COLORS
end
