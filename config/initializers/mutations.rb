MUTATIONS_DEFAULTS = Mutations::DefaultErrorMessageCreator::MESSAGES

# I don't like the errors that mutations provides for :before and :after,
# so I override them with my own.
MUTATIONS_DEFAULTS[:before] = "is too far in the future"
MUTATIONS_DEFAULTS[:after]  = "is too far in the past"
