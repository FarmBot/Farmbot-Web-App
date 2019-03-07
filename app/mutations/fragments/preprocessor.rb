module Fragments
  class Preprocessor
    Corpus = CeleryScriptSettingsBag::Corpus

    def self.run!(kind:, args:, body:, device:)
      canonical = {kind: kind, args: args, body: body}
      slicer    = CeleryScript::Slicer.new
      tree      = CeleryScript::AstNode.new(canonical.deep_symbolize_keys)
      checker   = CeleryScript::Checker.new(tree, Corpus, device)
      checker.run!
      slicer.run!(canonical)
    end
  end
end
