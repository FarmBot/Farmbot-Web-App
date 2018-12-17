module Fragments
  class Preprocessor
    CORPUS = CeleryScriptSettingsBag::Corpus

    def self.run!(kind:, args:, body:, device:)
      canonical = {kind: kind, args: args, body: body}
      slicer    = CeleryScript::Slicer.new
      tree      = CeleryScript::AstNode.new(canonical)
      checker   = CeleryScript::Checker.new(tree, CORPUS, device)
      # checker.run!
      slicer.run!(canonical)
    end
  end
end
