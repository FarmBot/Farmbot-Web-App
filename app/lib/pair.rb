class Pair
  WHY_I_WROTE_THIS = "http://stackoverflow.com/questions/"\
                     "42093912/does-ruby-have-a-pair-data-type/"\
                     "42095784#42095784"

  attr_accessor :head, :tail

  def self.[](h,t)
    self.new(h,t)
  end

  def initialize(h, t)
      @head, @tail = h, t
  end
end
