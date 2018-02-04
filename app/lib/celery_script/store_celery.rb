# API users hand us sequences as a JSON object with CeleryScript nodes nested
# within other nodes. We call this the "canonical representation". It's easy to
# traverse over, but tree structures are not well suited to the app's storage
# mechanism (SQL).
# To get around the limitation, we must convert sequence JSON from canonical to
# flat forms. `StoreCelery` handles the conversion and storage of CS Nodes.
module CeleryScript
class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.primary_nodes.destroy_all
      sequence.edge_nodes.destroy_all
      first_pass  = FirstPass.run!(nodes: flat_ir, sequence: sequence)
      second_pass = CeleryScript::SecondPass.run!(nodes: first_pass)
      first_pass
        .map do |x|
          nextt = first_pass[x[:next]]
          raise "FirstPass is broke - `next` node of #{x[:kind]} has a parent_arg_name. It shouldnt tho" if nextt[:instance].parent_arg_name
        end
      binding.pry if second_pass.map{|x| x.next.parent_arg_name}.compact.present?
      second_pass.map(&:save!)
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end
end
end