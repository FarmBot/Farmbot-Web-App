class AiFeedbackSerializer < ApplicationSerializer
  attributes :created_at,
             :prompt,
             :reaction
end
