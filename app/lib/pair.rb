# Every now and then, I need an array with EXACTLY two elements,
# or a hash with EXACTLY one key/value. It always felt hacky.
# I'm surprised this is not in the STDLIB. Please submit an issue if
# it is.
class Pair
  attr_accessor :head, :tail

  def initialize(h, t)
      @head, @tail = h, t
  end
end
