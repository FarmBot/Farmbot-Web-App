class WizardStepResultSerializer < ApplicationSerializer
  attributes :created_at,
             :updated_at,
             :answer,
             :outcome,
             :slug
end
