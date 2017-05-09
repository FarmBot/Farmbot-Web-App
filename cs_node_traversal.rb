def wrap1
results = {}
Sequence
  .all
  .map { |x|
    CeleryScript::JSONClimber.climb(x.as_json.deep_symbolize_keys) { |x|
      k = x.try(:fetch, :kind) || "???"
      results[k] ||= 0
      results[k] += 1
    }
  }

results
  .sort_by {|_key, value| value}
  .reverse
  .map{|x| puts "#{x.first} => #{x.last}"}
end

wrap1
# USAGE STATS:
# ============
# channel => 7
# execute_script => 7
# _if => 10
# nothing => 13
# take_photo => 23
# read_pin => 28
# send_message => 38
# move_relative => 197
# wait => 266
# write_pin => 304
# tool => 332
# execute => 361
# sequence => 372
# move_absolute => 1056
# coordinate => 1780
