class Sequence < ActiveRecord::Base
  include CeleryScriptSettingsBag
  COLORS = %w(blue green yellow orange purple pink gray red)
  belongs_to :device
  has_many :regimen_items
  has_many  :sequence_dependencies, dependent: :destroy

  serialize :body, Array
  serialize :args, Hash

  # allowable label colors for the frontend.
  [ :name, :kind ].each { |n| validates n, presence: true }
  validates :color, inclusion: { in: COLORS }
  validates :name, uniqueness: { scope: :device }

  after_find :maybe_migrate

  def maybe_migrate
    Sequences::Migrate.run!(sequence: self, device: self.device)
  end

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.color ||= "gray"
    self.kind ||= "sequence"
    self.body ||= []
    self.args ||= {}
  end
end
