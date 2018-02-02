describe CeleryScript::Slicer do
  it "has edge cases" do
    s = CeleryScript::FlatIrHelpers.flattened_heap
    [
      ["scope_declaration", "sequence",      "nothing"      ],
      ["move_absolute",     "sequence",      "nothing"      ],
      ["move_relative",     "move_absolute", "write_pin"    ],
      ["write_pin",         "write_pin",     "nothing"      ],
      ["sequence",          "nothing",       "move_absolute"],
    ]
    pending("TODO")
  end

end