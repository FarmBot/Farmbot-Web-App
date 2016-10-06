class Sequence < ActiveRecord::Base
  belongs_to :device
  has_many :regimen_items
  serialize :body, Array
  serialize :args, Hash

  # allowable label colors for the frontend.
  COLORS = %w(blue green yellow orange purple pink gray red)
  NODE_KINDS =  %w(move_absolute move_relative write_pin read_pin
                   wait send_message execute if_statement)

  [ :name, :kind ].each { |n| validates n, presence: true }
  validates_inclusion_of :color, in: COLORS
  validates_uniqueness_of :name, scope: :device

  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.color ||= COLORS.sample
    self.kind ||= "sequence"
    self.body ||= []
    self.args ||= {}
  end
end
