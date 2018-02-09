
def find_next_seq
  Sequence.where(migrated_nodes: false).order("created_at").last
end
next_seq = find_next_seq

until next_seq == nil
  t = Time.now
  puts "Migrating sequence #{next_seq.id}: #{next_seq.name}"
  Sequence.transaction { CeleryScript::StoreCelery.run!(sequence: sequence) }
  puts "migrated in #{Time.now - t} seconds"
  next_seq = find_next_seq
end

puts "ALL DONE!"