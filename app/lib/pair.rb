# http://stackoverflow.com/questions/42093912
#       /does-ruby-have-a-pair-data-type/42095784#42095784"
class Pair
  attr_accessor :head, :tail

  def initialize(h, t)
      @head, @tail = h, t
  end
end
