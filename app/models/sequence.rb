class Sequence < ActiveRecord::Base

  belongs_to :schedule
  belongs_to :device
  belongs_to :regimen, class_name: "Regimen"
  has_many :steps
  has_many :schedules, dependent: :destroy
  has_many :regimen_items

  # allowable label colors for the frontend.
  COLORS = %w(blue green yellow orange purple pink gray red)
  validates :name, presence: true
  validates_inclusion_of :color, in: COLORS
  validates_uniqueness_of :name, scope: :device

  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :init

  def init
    self.color ||= COLORS.sample
  end

end
